-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_create_order(BIGINT, JSONB, VARCHAR, TEXT, BIGINT, VARCHAR);
DROP PROCEDURE IF EXISTS sp_cancel_order(BIGINT, TEXT);
DROP PROCEDURE IF EXISTS sp_apply_bulk_discount(BIGINT, NUMERIC);

-- ----------------------------------------------------------------------------
-- CREATE ORDER
-- ACID transaction ve FOR UPDATE ile güvenli sipariş oluşturma

CREATE OR REPLACE PROCEDURE sp_create_order(
    p_user_id BIGINT,
    p_items JSONB,
    p_payment_method VARCHAR,
    p_shipping_address TEXT,
    INOUT p_order_id BIGINT DEFAULT NULL,
    INOUT p_order_code VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_item RECORD;
    v_product_id BIGINT;
    v_quantity INT;
    v_price NUMERIC(12, 2);
    v_stock INT;
    v_prod_name VARCHAR(200);
    v_subtotal NUMERIC(12, 2) := 0.00;
    v_shipping_fee NUMERIC(12, 2) := 0.00;
    v_total_amount NUMERIC(12, 2) := 0.00;
    v_txn_id VARCHAR(100);
BEGIN
    -- 1. Sepet boş mu kontrolü
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Sipariş sepeti boş olamaz!';
    END IF;

    -- 2. Race Condition Önlemi: İlgili ürünlerin stok satırlarını kilitle (FOR UPDATE)
    PERFORM 1 
    FROM inventory i
    WHERE i.product_id IN (
        SELECT (elem->>'product_id')::BIGINT 
        FROM jsonb_array_elements(p_items) elem
    )
    FOR UPDATE;

    -- 3. Stok yeterliliğini denetle ve ara toplamı hesapla
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_product_id := (v_item.value->>'product_id')::BIGINT;
        v_quantity := (v_item.value->>'quantity')::INT;

        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Ürün adedi sıfırdan büyük olmalıdır!';
        END IF;

        SELECT p.name, p.base_price, i.stock_quantity 
        INTO v_prod_name, v_price, v_stock
        FROM products p
        JOIN inventory i ON p.id = i.product_id
        WHERE p.id = v_product_id AND p.is_active = TRUE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Ürün bulunamadı veya satışta değil! ID: %', v_product_id;
        END IF;

        IF v_stock < v_quantity THEN
            RAISE EXCEPTION 'Yetersiz stok: % (Mevcut: %, İstenen: %)', v_prod_name, v_stock, v_quantity;
        END IF;

        v_subtotal := v_subtotal + ROUND(v_price * v_quantity, 2);
    END LOOP;

    -- 4. Kargo ve toplam tutarı hesapla (500 TL üzeri kargo bedava)
    IF v_subtotal >= 500.00 THEN
        v_shipping_fee := 0.00;
    ELSE
        v_shipping_fee := 49.90;
    END IF;
    v_total_amount := v_subtotal + v_shipping_fee;

    -- 5. Benzersiz sipariş kodu üret: ORD-YYYYMMDD-XXXX
    p_order_code := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

    -- 6. Sipariş başlığını ekle
    INSERT INTO orders (
        order_code, user_id, status, subtotal, shipping_fee, total_amount, shipping_address
    ) VALUES (
        p_order_code, p_user_id, 'PENDING', v_subtotal, v_shipping_fee, v_total_amount, p_shipping_address
    ) RETURNING id INTO p_order_id;

    -- 7. Sipariş kalemlerini ekle (Sipariş anındaki donuk fiyatla)
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_product_id := (v_item.value->>'product_id')::BIGINT;
        v_quantity := (v_item.value->>'quantity')::INT;

        SELECT base_price INTO v_price 
        FROM products 
        WHERE id = v_product_id;

        INSERT INTO order_items (
            order_id, product_id, unit_price, quantity, line_total
        ) VALUES (
            p_order_id, v_product_id, v_price, v_quantity, ROUND(v_price * v_quantity, 2)
        );
    END LOOP;

    -- 8. Ödeme kaydını oluştur
    v_txn_id := 'TXN-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || 
                LPAD(FLOOR(RANDOM() * 900 + 100)::TEXT, 3, '0');

    INSERT INTO payments (
        order_id, payment_method, transaction_id, amount, payment_status
    ) VALUES (
        p_order_id, p_payment_method, v_txn_id, v_total_amount, 'SUCCESS'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- CANCEL ORDER
-- Sipariş iptali, stok iadesi ve ödeme iadesi

CREATE OR REPLACE PROCEDURE sp_cancel_order(
    p_order_id BIGINT,
    p_reason TEXT DEFAULT 'Müşteri talebi'
)
LANGUAGE plpgsql AS $$
DECLARE
    v_current_status VARCHAR(20);
    v_item RECORD;
BEGIN
    -- Sipariş durumunu kontrol et
    SELECT status INTO v_current_status
    FROM orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sipariş bulunamadı! ID: %', p_order_id;
    END IF;

    IF v_current_status IN ('SHIPPED', 'DELIVERED') THEN
        RAISE EXCEPTION 'Kargoya verilmiş veya teslim edilmiş sipariş iptal edilemez! Durum: %', v_current_status;
    END IF;

    IF v_current_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Bu sipariş zaten iptal edilmiş!';
    END IF;

    -- 1. Siparişteki ürünlerin stoklarını depoya iade et
    FOR v_item IN 
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = p_order_id 
    LOOP
        UPDATE inventory
        SET stock_quantity = stock_quantity + v_item.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = v_item.product_id;
    END LOOP;

    -- 2. Sipariş durumunu CANCELLED yap
    UPDATE orders
    SET status = 'CANCELLED',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_order_id;

    -- 3. Varsa başarılı ödemeyi REFUNDED yap
    UPDATE payments
    SET payment_status = 'REFUNDED',
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = p_order_id AND payment_status = 'SUCCESS';

    -- 4. Audit tablosuna iptal logunu yaz
    INSERT INTO audit_logs (
        entity_name, entity_id, action, old_value, new_value, changed_by
    ) VALUES (
        'orders',
        p_order_id,
        'ORDER_CANCELLED',
        jsonb_build_object('status', v_current_status),
        jsonb_build_object('status', 'CANCELLED', 'reason', p_reason),
        'Cancellation'
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- APPLY BULK DISCOUNT
-- Seçili kategorideki tüm ürünlere toplu yüzde indirimi uygulama

CREATE OR REPLACE PROCEDURE sp_apply_bulk_discount(
    p_category_id BIGINT,
    p_discount_rate NUMERIC
)
LANGUAGE plpgsql AS $$
DECLARE
    v_affected_rows INT;
BEGIN
    -- İndirim oranı kontrolü (Örn: %1 ile %90 arası olmalı)
    IF p_discount_rate <= 0 OR p_discount_rate > 90 THEN
        RAISE EXCEPTION 'Geçersiz indirim oranı! 1 ile 90 arasında bir oran girin. Girilen: %', p_discount_rate;
    END IF;

    -- Seçilen kategorideki tüm ürünlerin baz fiyatını düşür
    UPDATE products
    SET base_price = ROUND(base_price * (1.0 - (p_discount_rate / 100.0)), 2),
        updated_at = CURRENT_TIMESTAMP
    WHERE category_id = p_category_id AND is_active = TRUE;

    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;

    IF v_affected_rows = 0 THEN
        RAISE NOTICE 'Bu kategoride güncellenecek aktif ürün bulunamadı. Kategori ID: %', p_category_id;
    END IF;
END;
$$;
