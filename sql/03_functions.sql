-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calculate_cart_total(JSONB);
DROP FUNCTION IF EXISTS fn_get_customer_lifetime_value(BIGINT);

-- ----------------------------------------------------------------------------
-- CALCULATE CART TOTAL
-- Sepet tutarı, vergi ve kargo hesaplama

CREATE OR REPLACE FUNCTION fn_calculate_cart_total(p_items JSONB)
RETURNS TABLE (
    subtotal NUMERIC(12, 2),
    tax_total NUMERIC(12, 2),
    shipping_fee NUMERIC(12, 2),
    total_amount NUMERIC(12, 2),
    free_shipping_qualified BOOLEAN
) AS $$
DECLARE
    v_subtotal NUMERIC(12, 2) := 0.00;
    v_tax_total NUMERIC(12, 2) := 0.00;
    v_shipping_fee NUMERIC(12, 2) := 0.00;
    v_free_shipping BOOLEAN := FALSE;
BEGIN
    -- Sepetteki her ürünün fiyat ve vergisini topla
    SELECT 
        COALESCE(SUM(ROUND(p.base_price * (item->>'quantity')::INT, 2)), 0.00),
        COALESCE(SUM(ROUND((p.base_price * (item->>'quantity')::INT) * (p.tax_rate / 100.0), 2)), 0.00)
    INTO v_subtotal, v_tax_total
    FROM jsonb_array_elements(p_items) AS item
    JOIN products p ON p.id = (item->>'product_id')::BIGINT
    WHERE p.is_active = TRUE;

    -- 500 TL üzeri kargo bedava kuralı
    IF v_subtotal >= 500.00 THEN
        v_shipping_fee := 0.00;
        v_free_shipping := TRUE;
    ELSE
        v_shipping_fee := 49.90;
        v_free_shipping := FALSE;
    END IF;

    -- Tablo formatında tek satır geri dön
    RETURN QUERY SELECT 
        v_subtotal,
        v_tax_total,
        v_shipping_fee,
        ROUND(v_subtotal + v_shipping_fee, 2),
        v_free_shipping;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- CUSTOMER LIFETIME VALUE
-- Müşterinin bıraktığı net ciro tutarı

CREATE OR REPLACE FUNCTION fn_get_customer_lifetime_value(p_user_id BIGINT)
RETURNS NUMERIC(12, 2) AS $$
DECLARE
    v_ltv NUMERIC(12, 2) := 0.00;
BEGIN
    SELECT COALESCE(SUM(total_amount), 0.00)
    INTO v_ltv
    FROM orders
    WHERE user_id = p_user_id
      AND status != 'CANCELLED';

    RETURN v_ltv;
END;
$$ LANGUAGE plpgsql;
