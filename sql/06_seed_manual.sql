-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TEMEL KULLANICILAR (Admin ve Örnek Müşteriler)

INSERT INTO users (email, password_hash, full_name, phone, address, role, status)
VALUES 
    ('semih@semihaydin.dev', '$2b$12$e8x/kYd7Q9Lz2w8uP8V8I.V1mQ4ZpL9qVzY3N1P9rT5L2e8x/kYd7', 'Semih Aydın', '05321234567', 'Ortahisar, Trabzon', 'ADMIN', 'ACTIVE'),
    ('kaan.ozturk@gmail.com', '$2b$12$e8x/kYd7Q9Lz2w8uP8V8I.V1mQ4ZpL9qVzY3N1P9rT5L2e8x/kYd7', 'Kaan Öztürk', '05423334455', 'Kadıköy, İstanbul', 'CUSTOMER', 'ACTIVE'),
    ('zeynep.demir@outlook.com', '$2b$12$e8x/kYd7Q9Lz2w8uP8V8I.V1mQ4ZpL9qVzY3N1P9rT5L2e8x/kYd7', 'Zeynep Demir', '05556667788', 'Çankaya, Ankara', 'CUSTOMER', 'ACTIVE'),
    ('burak.kaya@hotmail.com', '$2b$12$e8x/kYd7Q9Lz2w8uP8V8I.V1mQ4ZpL9qVzY3N1P9rT5L2e8x/kYd7', 'Burak Kaya', '05337778899', 'Karşıyaka, İzmir', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. HİYERARŞİK KATEGORİLER (Teknoloji & Tüketici Elektroniği)

-- Ana Kategoriler
INSERT INTO categories (name, link, description)
VALUES 
    ('Bilgisayar & Donanım', 'bilgisayar-donanim', 'Dizüstü, masaüstü bilgisayarlar ve parçalar'),
    ('Telefon & Aksesuar', 'telefon-aksesuar', 'Akıllı telefonlar, şarj aletleri ve kılıflar'),
    ('Ses & Görüntü', 'ses-goruntu', 'Kablosuz kulaklıklar, hoparlörler ve monitörler'),
    ('Giyilebilir Teknoloji', 'giyilebilir-teknoloji', 'Akıllı saatler ve bileklikler')
ON CONFLICT (link) DO NOTHING;

-- Alt Kategoriler
INSERT INTO categories (parent_id, name, link, description)
VALUES 
    ((SELECT id FROM categories WHERE link = 'bilgisayar-donanim'), 'Dizüstü Bilgisayarlar', 'dizustu-bilgisayarlar', 'Taşınabilir ultrabook ve oyuncu laptopları'),
    ((SELECT id FROM categories WHERE link = 'bilgisayar-donanim'), 'Çevre Birimleri', 'cevre-birimleri', 'Mekanik klavye, fare ve kulaklık setleri'),
    ((SELECT id FROM categories WHERE link = 'telefon-aksesuar'), 'Akıllı Telefonlar', 'akilli-telefonlar', 'iOS ve Android amiral gemisi telefonlar'),
    ((SELECT id FROM categories WHERE link = 'ses-goruntu'), 'Kulaklıklar', 'kulakliklar', 'Gürültü engelleyici kulak içi ve kulak üstü modeller'),
    ((SELECT id FROM categories WHERE link = 'giyilebilir-teknoloji'), 'Akıllı Saatler', 'akilli-saatler', 'Spor ve sağlık takipli akıllı saatler')
ON CONFLICT (link) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. BAŞLANGIÇ AMİRAL GEMİSİ ÜRÜNLER VE STOKLARI

-- 1. Apple MacBook Air M3
INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'dizustu-bilgisayarlar'),
    'PRD-APL-MACM3',
    'Apple MacBook Air M3 16GB 512GB Gece Yarısı',
    'Liquid Retina ekran, M3 çip, magsafe şarj desteği',
    47999.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-APL-MACM3'),
    18, 2, 5
) ON CONFLICT (product_id) DO NOTHING;

-- 2. Apple iPhone 15 Pro
INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'akilli-telefonlar'),
    'PRD-APL-IP15P',
    'Apple iPhone 15 Pro 128GB Doğal Titanyum',
    'A17 Pro çip, 48MP kamera, USB-C bağlantı',
    67999.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-APL-IP15P'),
    4, 1, 5 -- Kritik stok örneği (stok <= threshold)
) ON CONFLICT (product_id) DO NOTHING;

-- 3. Sony WH-1000XM5 Kulaklık
INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'kulakliklar'),
    'PRD-SNY-XM5BLK',
    'Sony WH-1000XM5 Kablosuz Gürültü Engelleyici Kulaklık',
    'Sektör lideri ANC, 30 saat pil ömrü, Hi-Res Audio',
    13499.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-SNY-XM5BLK'),
    25, 0, 8
) ON CONFLICT (product_id) DO NOTHING;

-- 4. Logitech MX Master 3S Fare
INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'cevre-birimleri'),
    'PRD-LOG-MXM3S',
    'Logitech MX Master 3S Kablosuz Ergonomik Fare',
    '8000 DPI Darkfield sensör, sessiz tıklama, MagSpeed tekerlek',
    3899.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-LOG-MXM3S'),
    40, 3, 10
) ON CONFLICT (product_id) DO NOTHING;
