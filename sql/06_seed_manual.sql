-- ============================================================================
-- BGM213 Veritabanı ve Yönetimi - Proje
-- Semih Aydın (252302003) | Trabzon Üniversitesi Bilgisayar Mühendisliği
-- ============================================================================

-- 1. Başlangıç Kullanıcıları (Admin ve Örnek Müşteriler)
INSERT INTO users (email, password_hash, full_name, phone, address, role, status)
VALUES 
    ('semih@semihaydin.dev', 'demo_hash_123', 'Semih Aydın', '05321234567', 'Ortahisar, Trabzon', 'ADMIN', 'ACTIVE'),
    ('alperen.yurt@gmail.com', 'demo_hash_123', 'Alperen Yurt', '05354445566', 'Ortahisar, Trabzon', 'CUSTOMER', 'ACTIVE'),
    ('kaan.ozturk@gmail.com', 'demo_hash_123', 'Kaan Öztürk', '05423334455', 'Kadıköy, İstanbul', 'CUSTOMER', 'ACTIVE'),
    ('zeynep.demir@outlook.com', 'demo_hash_123', 'Zeynep Demir', '05556667788', 'Çankaya, Ankara', 'CUSTOMER', 'ACTIVE'),
    ('burak.kaya@hotmail.com', 'demo_hash_123', 'Burak Kaya', '05337778899', 'Karşıyaka, İzmir', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 2. Ana ve Alt Kategoriler
INSERT INTO categories (name, link, description)
VALUES 
    ('Bilgisayar & Donanım', 'bilgisayar-donanim', 'Dizüstü, masaüstü bilgisayarlar ve parçalar'),
    ('Telefon & Aksesuar', 'telefon-aksesuar', 'Akıllı telefonlar, şarj aletleri ve kılıflar'),
    ('Ses & Görüntü', 'ses-goruntu', 'Kablosuz kulaklıklar, hoparlörler ve monitörler'),
    ('Giyilebilir Teknoloji', 'giyilebilir-teknoloji', 'Akıllı saatler ve bileklikler')
ON CONFLICT (link) DO NOTHING;

INSERT INTO categories (parent_id, name, link, description)
VALUES 
    ((SELECT id FROM categories WHERE link = 'bilgisayar-donanim'), 'Dizüstü Bilgisayarlar', 'dizustu-bilgisayarlar', 'Taşınabilir ultrabook ve oyuncu laptopları'),
    ((SELECT id FROM categories WHERE link = 'bilgisayar-donanim'), 'Çevre Birimleri', 'cevre-birimleri', 'Mekanik klavye, fare ve kulaklık setleri'),
    ((SELECT id FROM categories WHERE link = 'telefon-aksesuar'), 'Akıllı Telefonlar', 'akilli-telefonlar', 'iOS ve Android telefonlar'),
    ((SELECT id FROM categories WHERE link = 'ses-goruntu'), 'Kulaklıklar', 'kulakliklar', 'Kulak içi ve kulak üstü kulaklıklar'),
    ((SELECT id FROM categories WHERE link = 'giyilebilir-teknoloji'), 'Akıllı Saatler', 'akilli-saatler', 'Spor ve sağlık takipli akıllı saatler')
ON CONFLICT (link) DO NOTHING;

-- 3. Örnek Ürünler ve Stokları
INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'dizustu-bilgisayarlar'),
    'PRD-APL-MACM3',
    'Apple MacBook Pro 14 inç Space Grey',
    'Liquid Retina ekran, M3 çip, magsafe şarj desteği',
    '/images/products/prod_78.webp',
    47999.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-APL-MACM3'),
    18, 0, 5
) ON CONFLICT (product_id) DO NOTHING;

INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'akilli-telefonlar'),
    'PRD-APL-IP15P',
    'Apple iPhone 15 Pro 128GB Doğal Titanyum',
    'A17 Pro çip, 48MP kamera, USB-C bağlantı',
    '/images/products/prod_123.webp',
    67999.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-APL-IP15P'),
    4, 0, 5
) ON CONFLICT (product_id) DO NOTHING;

INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'kulakliklar'),
    'PRD-SNY-XM5BLK',
    'Apple AirPods Max Silver Studio Kulaklık',
    'Aktif gürültü engelleme, 30 saat pil ömrü',
    '/images/products/prod_101.webp',
    26499.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-SNY-XM5BLK'),
    25, 0, 8
) ON CONFLICT (product_id) DO NOTHING;

INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate)
VALUES (
    (SELECT id FROM categories WHERE link = 'cevre-birimleri'),
    'PRD-LOG-MXM3S',
    'Apple AirPower Kablosuz Şarj İstasyonu',
    'Çoklu cihaz hızlı kablosuz şarj desteği',
    '/images/products/prod_102.webp',
    3899.00,
    20.00
) ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold)
VALUES (
    (SELECT id FROM products WHERE product_code = 'PRD-LOG-MXM3S'),
    40, 0, 10
) ON CONFLICT (product_id) DO NOTHING;
