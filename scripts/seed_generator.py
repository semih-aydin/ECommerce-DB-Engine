import os
import sys
import random
from datetime import datetime, timedelta, timezone
import psycopg2

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ecommerce_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")
DATABASE_URL = os.getenv("DATABASE_URL")

def connectDb():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )

FIRST_NAMES = [
    "Kaan", "Burak", "Emre", "Can", "Oğuz", "Serkan", "Tolga", "Mert", "Barış", "Deniz",
    "Onur", "Berk", "Alper", "Arda", "Efe", "Kerem", "Doruk", "Bora", "Emir", "Yiğit",
    "Furkan", "Görkem", "Batuhan", "Umut", "Volkan", "Koray", "Cem", "Tuna", "Sarp", "Kutay",
    "Zeynep", "Elif", "Merve", "Büşra", "Esra", "Seda", "Derya", "Selin", "Gizem", "Ebru",
    "Gamze", "Tuğba", "Ceren", "Melis", "Pınar", "Damla", "Hazal", "İrem", "Ece", "Dilara"
]

LAST_NAMES = [
    "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Özdemir",
    "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
    "Polat", "Erdoğan", "Korkmaz", "Yavuz", "Güler", "Bulut", "Keskin", "Yalçın", "Güneş",
    "Bozkurt", "Acar", "Aksoy", "Uysal", "Taş", "Tekin", "Erdem", "Alkan", "Avcı", "Sarı"
]

EMAIL_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "icloud.com"]

ADDRESSES = [
    ("İstanbul", "Kadıköy", "Caferağa Mah. Moda Cad. No:"),
    ("İstanbul", "Beşiktaş", "Sinanpaşa Mah. Şair Nedim Cad. No:"),
    ("İstanbul", "Üsküdar", "Mimar Sinan Mah. Hakimiyeti Milliye Cad. No:"),
    ("İstanbul", "Şişli", "Halaskargazi Mah. Abide-i Hürriyet Cad. No:"),
    ("Ankara", "Çankaya", "Tunalı Hilmi Cad. No:"),
    ("Ankara", "Çankaya", "Bahçelievler 7. Cadde No:"),
    ("Ankara", "Yenimahalle", "Batıkent Kentkoop Mah. No:"),
    ("İzmir", "Karşıyaka", "Bostanlı Mah. Cemal Gürsel Cad. No:"),
    ("İzmir", "Konak", "Alsancak Mah. Kıbrıs Şehitleri Cad. No:"),
    ("İzmir", "Bornova", "Kazımdirik Mah. Sanayi Cad. No:"),
    ("Trabzon", "Ortahisar", "Konaklar Mah. Üniversite Cad. No:"),
    ("Trabzon", "Ortahisar", "Gazipaşa Mah. Kunduracılar Cad. No:"),
    ("Trabzon", "Akçaabat", "Söğütlü Mah. Sahil Cad. No:"),
    ("Bursa", "Nilüfer", "Görükle Mah. Üniversite Cad. No:"),
    ("Antalya", "Muratpaşa", "Şirinyalı Mah. İsmet Gökşen Cad. No:"),
    ("Eskişehir", "Tepebaşı", "Yenibağlar Mah. Üniversite Cad. No:")
]

TECH_PRODUCTS = [
    ("PRD-APL-MBP14", "Apple MacBook Pro 14 inç M3 Pro 18GB 512GB", "Liquid Retina XDR ekran, Space Black", 79999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-APL-MBP16", "Apple MacBook Pro 16 inç M3 Max 36GB 1TB", "Profesyonel Apple dizüstü", 129999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-ASU-ROG16", "Asus ROG Strix SCAR 16 RTX 4080", "Intel i9 14900HX, 32GB DDR5, 1TB NVMe", 89999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-DEL-XPS13", "Dell XPS 13 Plus Intel Core Ultra 7", "OLED ekran, 16GB RAM, 1TB SSD", 59999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-LNV-LEG07", "Lenovo Legion Pro 7 RTX 4090", "Ryzen 9 7945HX, 32GB RAM, 2TB SSD", 112000.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-MSI-STH14", "MSI Stealth 14 Studio RTX 4060", "İnce magnezyum kasa, 16GB RAM", 52999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-ACR-NIT05", "Acer Nitro 5 i5 RTX 4050 Oyuncu Laptop", "Oyuncu dizüstü bilgisayarı", 29999.00, 20.00, "dizustu-bilgisayarlar"),
    ("PRD-APL-IP15B", "Apple iPhone 15 128GB Mavi", "A16 Bionic çip, 48MP kamera", 53999.00, 20.00, "akilli-telefonlar"),
    ("PRD-APL-IP15M", "Apple iPhone 15 Pro Max 256GB Naturel Titanyum", "5x Telefoto lens, Titanyum kasa", 79999.00, 20.00, "akilli-telefonlar"),
    ("PRD-SMS-S24PL", "Samsung Galaxy S24 Plus 256GB Gri", "Galaxy AI, QHD+ AMOLED ekran", 46999.00, 20.00, "akilli-telefonlar"),
    ("PRD-SMS-S24UT", "Samsung Galaxy S24 Ultra 512GB Titanyum Siyah", "Dahili S-Pen, 200MP kamera", 73999.00, 20.00, "akilli-telefonlar"),
    ("PRD-XIA-14PR", "Xiaomi 14 Pro 512GB Siyah", "Leica lens, Snapdragon 8 Gen 3", 49999.00, 20.00, "akilli-telefonlar"),
    ("PRD-XIA-RED13", "Xiaomi Redmi Note 13 Pro 256GB", "200MP kamera, 67W hızlı şarj", 15999.00, 20.00, "akilli-telefonlar"),
    ("PRD-GOO-PXL8P", "Google Pixel 8 Pro 128GB Obsidyen", "Tensor G3 çip", 41500.00, 20.00, "akilli-telefonlar"),
    ("PRD-APL-APP02", "Apple AirPods Pro (2. Nesil) USB-C", "Aktif gürültü engelleme", 8999.00, 20.00, "kulakliklar"),
    ("PRD-APL-APMAX", "Apple AirPods Max Gök Mavisi", "Yüksek kaliteli kulak üstü ses", 26999.00, 20.00, "kulakliklar"),
    ("PRD-SNY-WF5BK", "Sony WF-1000XM5 TWS Kulak İçi Kulaklık", "Entegre V2 işlemci", 9499.00, 20.00, "kulakliklar"),
    ("PRD-BSE-QC45B", "Bose QuietComfort 45 Kablosuz Kulaklık", "Kablosuz ANC kulaklık", 11999.00, 20.00, "kulakliklar"),
    ("PRD-SEN-HD660", "Sennheiser HD 660S2 Stüdyo Kulaklık", "Odyofil düzeyinde stüdyo sesi", 18500.00, 20.00, "kulakliklar"),
    ("PRD-JBL-FLIP6", "JBL Flip 6 Bluetooth Hoparlör", "Su geçirmez taşınabilir hoparlör", 4199.00, 20.00, "kulakliklar"),
    ("PRD-LOG-MXKEY", "Logitech MX Keys S Aydınlatmalı Klavye", "Sessiz ve akıllı aydınlatmalı klavye", 4399.00, 20.00, "cevre-birimleri"),
    ("PRD-LOG-GPRX2", "Logitech G Pro X Superlight 2 Beyaz", "60g ultra hafif oyuncu faresi", 5699.00, 20.00, "cevre-birimleri"),
    ("PRD-RAZ-BLAKV", "Razer BlackWidow V4 Pro Mekanik Klavye", "Green Switch, RGB mekanik klavye", 7999.00, 20.00, "cevre-birimleri"),
    ("PRD-STL-ARCT9", "SteelSeries Arctis Nova Pro Wireless", "Çift batarya sistemli oyuncu kulaklığı", 13999.00, 20.00, "cevre-birimleri"),
    ("PRD-ANK-GAN73", "Anker 737 GaNPrime 120W Şarj Cihazı", "3 portlu hızlı şarj adaptörü", 2699.00, 20.00, "cevre-birimleri"),
    ("PRD-DEL-U2723", "Dell UltraSharp U2723QE 27 inç 4K Monitör", "IPS Black panel 4K monitör", 21500.00, 20.00, "cevre-birimleri"),
    ("PRD-APL-WUT02", "Apple Watch Ultra 2 49mm Titanyum", "Çift frekanslı GPS, 3000 nit", 41999.00, 20.00, "akilli-saatler"),
    ("PRD-APL-WS09B", "Apple Watch Series 9 45mm Gece Yarısı", "S9 SiP işlemcili akıllı saat", 16999.00, 20.00, "akilli-saatler"),
    ("PRD-SMS-GW06C", "Samsung Galaxy Watch 6 Classic 47mm", "Döner mekanik çerçeveli saat", 9499.00, 20.00, "akilli-saatler"),
    ("PRD-GAR-FEN07", "Garmin Fenix 7X Pro Solar Sapphire", "Güneş enerjili spor saati", 38999.00, 20.00, "akilli-saatler"),
    ("PRD-HUA-WGT04", "Huawei Watch GT 4 46mm Kahverengi Deri", "14 gün pil ömürlü akıllı saat", 7499.00, 20.00, "akilli-saatler")
]

TECH_BRANDS = ["Apple", "Samsung", "Anker", "Logitech", "UGreen", "Spigen", "Baseus", "Corsair", "SteelSeries", "HyperX", "Kingston", "SanDisk", "TP-Link", "Razer"]
TECH_ITEMS = [
    ("Örgülü Type-C Şarj Kablosu 2m", 349.00, "cevre-birimleri"),
    ("65W GaN Hızlı Şarj Adaptörü", 1199.00, "cevre-birimleri"),
    ("Manyetik Magsafe Araç Tutucu", 749.00, "cevre-birimleri"),
    ("Armor Darbeye Dayanıklı Kılıf", 599.00, "cevre-birimleri"),
    ("1TB Taşınabilir NVMe SSD 1050MB/s", 3899.00, "dizustu-bilgisayarlar"),
    ("2TB Harici Sabit Disk USB 3.0", 2499.00, "dizustu-bilgisayarlar"),
    ("Speed RGB XL Oyuncu Mousepad", 899.00, "cevre-birimleri"),
    ("Darbe Emici 15.6 inç Laptop Kılıfı", 650.00, "dizustu-bilgisayarlar"),
    ("Ergonomik Alüminyum Laptop Standı", 1250.00, "dizustu-bilgisayarlar"),
    ("7 in 1 USB-C Çoklayıcı Hub HDMI 4K", 1699.00, "dizustu-bilgisayarlar"),
    ("Silikon Spor Akıllı Saat Kordonu", 399.00, "akilli-saatler"),
    ("Deri Klasik Saat Kordonu 22mm", 699.00, "akilli-saatler"),
    ("TWS Bluetooth 5.3 Kulak İçi Kulaklık", 1450.00, "kulakliklar"),
    ("Gürültü Önleyici Mikrofonlu Oyuncu Kulaklığı", 2999.00, "kulakliklar"),
    ("Wi-Fi 6 AX3000 Çift Bant Router", 2850.00, "cevre-birimleri"),
    ("Full HD 1080p 60fps Yayıncı Web Kamerası", 3199.00, "cevre-birimleri")
]

def randomDate(daysBack=365):
    return datetime.now(timezone.utc) - timedelta(seconds=random.randint(0, daysBack * 86400))

def cleanTr(text):
    trMap = str.maketrans("ığüşöçİĞÜŞÖÇ", "igusocIGUSOC")
    return text.translate(trMap).lower()

def main():
    conn = connectDb()
    conn.autocommit = True
    cur = conn.cursor()

    # Admin kullanicisi
    cur.execute("""
        INSERT INTO users (email, password_hash, full_name, phone, address, role, status)
        VALUES ('semih@semihaydin.dev', '$2b$12$e8x/kYd7Q9Lz2w8uP8V8I.V1mQ4ZpL9qVzY3N1P9rT5L2e8x/kYd7', 
                'Semih Aydın', '05321234567', 'Ortahisar, Trabzon', 'ADMIN', 'ACTIVE')
        ON CONFLICT (email) DO UPDATE SET full_name = 'Semih Aydın', role = 'ADMIN';
    """)

    # Musterileri olustur
    usedEmails = set()
    for _ in range(60):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        fullName = f"{first} {last}"

        num = random.randint(10, 999) if random.random() > 0.4 else ""
        sep = random.choice([".", "", "_"])
        email = f"{cleanTr(first)}{sep}{cleanTr(last)}{num}@{random.choice(EMAIL_DOMAINS)}"

        if email in usedEmails or email == "semih@semihaydin.dev":
            continue
        usedEmails.add(email)

        city, district, street = random.choice(ADDRESSES)
        address = f"{district}, {street}{random.randint(1, 95)} D:{random.randint(1, 12)}, {city}"
        phone = f"05{random.choice(['30', '32', '33', '41', '42', '52', '53', '55'])}{random.randint(1000000, 9999999)}"

        cur.execute("""
            INSERT INTO users (email, password_hash, full_name, phone, address, role, status, created_at)
            VALUES (%s, %s, %s, %s, %s, 'CUSTOMER', 'ACTIVE', %s)
            ON CONFLICT (email) DO NOTHING;
        """, (email, "$2b$12$dummyhashforpasswordtesting1234567890123456789012345", fullName, phone, address, randomDate(330)))

    cur.execute("SELECT id FROM users WHERE role = 'CUSTOMER'")
    userIds = [row[0] for row in cur.fetchall()]
    print(f"Musteriler hazir: {len(userIds)} adet")

    # Alt kategorileri cek
    cur.execute("SELECT id, link FROM categories WHERE parent_id IS NOT NULL")
    catMap = {link: cid for cid, link in cur.fetchall()}

    # Temel urunleri ekle
    for sku, name, desc, price, tax, catLink in TECH_PRODUCTS:
        cid = catMap.get(catLink)
        if not cid:
            continue
        cur.execute("""
            INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            ON CONFLICT (product_code) DO NOTHING RETURNING id;
        """, (cid, sku, name, desc, price, tax))
        res = cur.fetchone()
        if res:
            cur.execute("""
                INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold, last_restocked_at)
                VALUES (%s, %s, 0, 10, %s) ON CONFLICT (product_id) DO NOTHING;
            """, (res[0], random.randint(40, 120), randomDate(60)))

    # 155 urune tamamla
    cur.execute("SELECT COUNT(*) FROM products")
    needed = max(0, 155 - cur.fetchone()[0])

    for _ in range(needed):
        brand = random.choice(TECH_BRANDS)
        itemName, baseP, catLink = random.choice(TECH_ITEMS)
        cid = catMap.get(catLink, list(catMap.values())[0])
        price = round(baseP * random.uniform(0.85, 1.30), 2)
        sku = f"PRD-{brand[:3].upper()}-{random.randint(10000, 99999)}"
        name = f"{brand} {itemName}"

        cur.execute("""
            INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate, is_active)
            VALUES (%s, %s, %s, %s, %s, 20.00, TRUE)
            ON CONFLICT (product_code) DO NOTHING RETURNING id;
        """, (cid, sku, name, f"Orijinal {brand} garantili urun", price))
        res = cur.fetchone()
        if res:
            cur.execute("""
                INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold, last_restocked_at)
                VALUES (%s, %s, 0, 10, %s) ON CONFLICT (product_id) DO NOTHING;
            """, (res[0], random.randint(30, 90), randomDate(80)))

    cur.execute("SELECT COUNT(*) FROM products WHERE is_active = TRUE")
    print(f"Urunler hazir: {cur.fetchone()[0]} adet")

    # 330 adet siparis olustur
    statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "PROCESSING", "SHIPPED", "CANCELLED"]
    payMethods = ["CREDIT_CARD", "CREDIT_CARD", "WALLET", "COUPON"]

    for _ in range(330):
        cur.execute("""
            SELECT p.id, p.base_price FROM products p
            JOIN inventory i ON p.id = i.product_id
            WHERE p.is_active = TRUE AND i.stock_quantity >= 5
        """)
        inStock = cur.fetchall()
        if not inStock:
            break

        uid = random.choice(userIds)
        daysBack = int(365 * (random.random() ** 1.8))
        orderDate = datetime.now(timezone.utc) - timedelta(days=daysBack, seconds=random.randint(0, 86400))
        status = random.choice(statuses)
        orderCode = f"ORD-{orderDate.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        city, district, street = random.choice(ADDRESSES)
        shippingAddr = f"{district}, {street}{random.randint(1, 80)}, {city}"

        chosen = random.sample(inStock, k=min(len(inStock), random.randint(1, 3)))
        subtotal = 0.0
        itemRows = []
        for pid, price in chosen:
            qty = random.randint(1, 2)
            lineTot = round(float(price) * qty, 2)
            subtotal += lineTot
            itemRows.append((pid, price, qty, lineTot))

        shippingFee = 0.00 if subtotal >= 500.00 else 49.90
        totalAmount = round(subtotal + shippingFee, 2)

        cur.execute("""
            INSERT INTO orders (order_code, user_id, status, subtotal, shipping_fee, total_amount, shipping_address, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (order_code) DO NOTHING RETURNING id;
        """, (orderCode, uid, status, subtotal, shippingFee, totalAmount, shippingAddr, orderDate, orderDate))

        res = cur.fetchone()
        if not res:
            continue
        oid = res[0]

        for pid, price, qty, lineTot in itemRows:
            cur.execute("""
                INSERT INTO order_items (order_id, product_id, unit_price, quantity, line_total, created_at)
                VALUES (%s, %s, %s, %s, %s, %s);
            """, (oid, pid, price, qty, lineTot, orderDate))

        payStatus = "REFUNDED" if status == "CANCELLED" else "SUCCESS"
        txnId = f"TXN-{orderDate.strftime('%Y%m%d%H%M%S')}-{random.randint(100, 999)}"
        cur.execute("""
            INSERT INTO payments (order_id, payment_method, transaction_id, amount, payment_status, payment_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (oid, random.choice(payMethods), txnId, totalAmount, payStatus, orderDate, orderDate))

        if status in ["SHIPPED", "DELIVERED"]:
            carrier = random.choice(["Yurtiçi Kargo", "Aras Kargo", "Kolay Gelsin", "MNG Kargo"])
            trk = f"TRK-{random.randint(1000000000, 9999999999)}"
            delDate = orderDate + timedelta(days=random.randint(2, 4)) if status == "DELIVERED" else None
            shipStatus = "DELIVERED" if status == "DELIVERED" else "IN_TRANSIT"
            cur.execute("""
                INSERT INTO shipments (order_id, tracking_number, carrier, status, shipped_at, delivered_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (oid, trk, carrier, shipStatus, orderDate + timedelta(days=1), delDate, orderDate))

    # Kritik stok ornekleri icin birkac urunun stogunu dusurelim
    cur.execute("UPDATE inventory SET stock_quantity = 2 WHERE product_id IN (SELECT id FROM products LIMIT 5);")
    cur.execute("UPDATE inventory SET stock_quantity = 0 WHERE product_id IN (SELECT id FROM products OFFSET 5 LIMIT 3);")

    # Ornek audit loglari
    cur.execute("""
        INSERT INTO audit_logs (entity_name, entity_id, action, old_value, new_value, changed_by, changed_at)
        VALUES 
        ('products', 1, 'PRICE_UPDATE', '{"base_price": 45999.00}'::jsonb, '{"base_price": 47999.00}'::jsonb, 'Creation', NOW() - INTERVAL '7 days'),
        ('products', 2, 'PRICE_UPDATE', '{"base_price": 64999.00}'::jsonb, '{"base_price": 67999.00}'::jsonb, 'Creation', NOW() - INTERVAL '3 days');
    """)

    cur.execute("SELECT COUNT(*) FROM orders")
    print(f"Siparisler hazir: {cur.fetchone()[0]} adet")

    cur.close()
    conn.close()
    print("Seed islemi tamamlandi.")

if __name__ == "__main__":
    main()
