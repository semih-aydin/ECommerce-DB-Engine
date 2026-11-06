-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

DROP VIEW IF EXISTS vw_monthly_sales_analytics CASCADE;
DROP VIEW IF EXISTS vw_inventory_critical_status CASCADE;
DROP VIEW IF EXISTS vw_customer_summary CASCADE;

-- ----------------------------------------------------------------------------
-- CUSTOMER SUMMARY
-- Müşteri sipariş ve harcama özeti

CREATE OR REPLACE VIEW vw_customer_summary AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.status AS user_status,
    COUNT(o.id) AS total_orders,
    COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END) AS cancelled_orders,
    ROUND((COUNT(CASE WHEN o.status = 'CANCELLED' THEN 1 END)::NUMERIC / NULLIF(COUNT(o.id), 0)) * 100, 2) AS cancellation_rate,
    COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN o.total_amount ELSE 0 END), 0.00) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.full_name, u.email, u.status;

-- ----------------------------------------------------------------------------
-- INVENTORY CRITICAL STATUS
-- Kritik stok durumu ve acil ürünler

CREATE OR REPLACE VIEW vw_inventory_critical_status AS
SELECT 
    p.id AS product_id,
    p.product_code,
    p.name AS product_name,
    c.name AS category_name,
    p.base_price,
    i.stock_quantity,
    i.reorder_threshold,
    (i.reorder_threshold - i.stock_quantity) AS shortage_amount,
    CASE 
        WHEN i.stock_quantity = 0 THEN 'CRITICAL'
        WHEN i.stock_quantity <= (i.reorder_threshold / 2) THEN 'HIGH'
        ELSE 'MEDIUM'
    END AS urgency_level,
    i.last_restocked_at
FROM inventory AS i
JOIN products AS p ON i.product_id = p.id
JOIN categories AS c ON p.category_id = c.id
WHERE i.stock_quantity <= i.reorder_threshold
  AND p.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- MONTHLY SALES ANALYTICS
-- Aylık satış, ciro ve büyüme analitiği

CREATE OR REPLACE VIEW vw_monthly_sales_analytics AS
WITH monthly_base AS (
    SELECT 
        DATE_TRUNC('month', created_at) AS sales_month,
        COUNT(id) AS total_orders,
        COUNT(CASE WHEN status != 'CANCELLED' THEN 1 END) AS successful_orders,
        COALESCE(SUM(CASE WHEN status != 'CANCELLED' THEN total_amount ELSE 0 END), 0.00) AS monthly_revenue
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
)
SELECT 
    sales_month,
    total_orders,
    successful_orders,
    monthly_revenue,
    SUM(monthly_revenue) OVER (ORDER BY sales_month) AS cumulative_revenue, -- Kümülatif ciro
    LAG(monthly_revenue, 1) OVER (ORDER BY sales_month) AS previous_month_revenue, -- Önceki ay
    ROUND(
        ((monthly_revenue - LAG(monthly_revenue, 1) OVER (ORDER BY sales_month)) / 
        NULLIF(LAG(monthly_revenue, 1) OVER (ORDER BY sales_month), 0)) * 100, 2
    ) AS mom_growth_rate, -- Büyüme oranı %
    ROUND(
        monthly_revenue / NULLIF(successful_orders, 0), 2
    ) AS avg_order_value -- Ortalama sepet
FROM monthly_base
ORDER BY sales_month DESC;
