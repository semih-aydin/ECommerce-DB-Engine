-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- USERS
-- Müşteri ve admin bilgileri

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY, -- Otomatik artan id
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    role VARCHAR(15) NOT NULL DEFAULT 'CUSTOMER' 
        CHECK (role IN ('ADMIN', 'CUSTOMER', 'STAFF')),
    status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- CATEGORIES
-- Hiyerarsik kategori

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY, -- Otomatik
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    link VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- Ürün bilgileri

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    product_code VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL 
        CHECK (base_price > 0), 
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00 
        CHECK (tax_rate >= 0 AND tax_rate <= 300),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- INVENTORY
-- Ürün stokları

CREATE TABLE inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0 
        CHECK (stock_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 
        CHECK (reserved_quantity >= 0),
    reorder_threshold INT NOT NULL DEFAULT 10 
        CHECK (reorder_threshold >= 0),
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- ORDERS
-- RD-YYYYMMDD-XXXX

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_code VARCHAR(35) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 
        CHECK (subtotal >= 0),
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 
        CHECK (shipping_fee >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 
        CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- ORDER_ITEMS
-- Sipariş detayları

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_price NUMERIC(12, 2) NOT NULL 
        CHECK (unit_price > 0),
    quantity INT NOT NULL 
        CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL 
        CHECK (line_total > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PAYMENTS
-- Ödeme kayıtları

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_method VARCHAR(30) NOT NULL 
        CHECK (payment_method IN ('CREDIT_CARD', 'WALLET', 'COUPON')),
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL 
        CHECK (amount > 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- SHIPMENTS
-- Kargo takip

CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    carrier VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PREPARING' 
        CHECK (status IN ('PREPARING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED')),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- AUDIT_LOGS
-- Değişimler

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,       -- ürün envanter sipariş vs.
    entity_id BIGINT NOT NULL,              
    action VARCHAR(30) NOT NULL,            -- 'PRICE_UPDATE', 'STOCK_ALERT', 'ORDER_CANCELLED'
    old_value JSONB,    
    new_value JSONB,
    changed_by VARCHAR(100) DEFAULT 'Creation',
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES 

CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_stock ON inventory(stock_quantity);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at);