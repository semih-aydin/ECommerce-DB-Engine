-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

DROP TRIGGER IF EXISTS trg_check_and_reduce_stock ON order_items;
DROP TRIGGER IF EXISTS trg_audit_product_price_change ON products;
DROP TRIGGER IF EXISTS trg_update_order_status_on_payment ON payments;

DROP FUNCTION IF EXISTS fn_trg_check_and_reduce_stock();
DROP FUNCTION IF EXISTS fn_trg_audit_product_price_change();
DROP FUNCTION IF EXISTS fn_trg_update_order_status_on_payment();

-- ----------------------------------------------------------------------------
-- 1. STOK DÜŞME VE DENETLEME TETİKLEYİCİSİ
-- Sipariş kalemi eklendiğinde depodaki stoğu düşer, yetersizse hata fırlatır

CREATE OR REPLACE FUNCTION fn_trg_check_and_reduce_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_stock INT;
    v_prod_name VARCHAR(200);
BEGIN
    -- Ürünün güncel stok miktarını al
    SELECT stock_quantity, name 
    INTO v_stock, v_prod_name
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE i.product_id = NEW.product_id;

    -- Stok yeterliliğini denetle
    IF v_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Yetersiz stok! Ürün: % (Mevcut: %, Talep: %)', 
            v_prod_name, v_stock, NEW.quantity;
    END IF;

    -- Stoğu otomatik azalt
    UPDATE inventory
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_and_reduce_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION fn_trg_check_and_reduce_stock();

-- ----------------------------------------------------------------------------
-- 2. FİYAT DEĞİŞİMİ DENETİM (AUDIT) TETİKLEYİCİSİ
-- Ürün baz fiyatı güncellendiğinde eski ve yeni fiyatı audit_logs'a yazar

CREATE OR REPLACE FUNCTION fn_trg_audit_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Fiyat gerçekten değiştiyse denetim tablosuna log at
    IF OLD.base_price <> NEW.base_price THEN
        INSERT INTO audit_logs (
            entity_name,
            entity_id,
            action,
            old_value,
            new_value,
            changed_by,
            changed_at
        ) VALUES (
            'products',
            NEW.id,
            'PRICE_UPDATE',
            jsonb_build_object(
                'product_code', OLD.product_code, 
                'name', OLD.name, 
                'base_price', OLD.base_price
            ),
            jsonb_build_object(
                'product_code', NEW.product_code, 
                'name', NEW.name, 
                'base_price', NEW.base_price
            ),
            'PriceTrigger',
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_product_price_change
AFTER UPDATE OF base_price ON products
FOR EACH ROW
EXECUTE FUNCTION fn_trg_audit_product_price_change();

-- ----------------------------------------------------------------------------
-- 3. ÖDEME ONAY TETİKLEYİCİSİ
-- Ödeme durumu SUCCESS olduğunda sipariş durumunu otomatik PROCESSING yapar

CREATE OR REPLACE FUNCTION fn_trg_update_order_status_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'SUCCESS' THEN
        UPDATE orders
        SET status = 'PROCESSING',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.order_id 
          AND status = 'PENDING';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_status_on_payment
AFTER INSERT OR UPDATE OF payment_status ON payments
FOR EACH ROW
EXECUTE FUNCTION fn_trg_update_order_status_on_payment();
