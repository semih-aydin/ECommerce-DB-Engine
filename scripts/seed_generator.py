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

# Her urun kendi ozel studyo fotografina (prod_ID.webp) baglidir
CATALOG = [
    # Dizustu Bilgisayarlar & Tabletler
    ("PRD-APL-78", "Apple MacBook Pro 14 inç Space Grey", "M3 Pro işlemci, Liquid Retina XDR ekran", 79999.00, "dizustu-bilgisayarlar", "/images/products/prod_78.webp"),
    ("PRD-ASU-79", "Asus Zenbook Pro Çift Ekranlı Laptop", "OLED dokunmatik ikinci ekran, Intel i7", 68500.00, "dizustu-bilgisayarlar", "/images/products/prod_79.webp"),
    ("PRD-HUA-80", "Huawei Matebook X Pro Ultrabook", "3.1K Real Colour FullView ekran, 16GB RAM", 54999.00, "dizustu-bilgisayarlar", "/images/products/prod_80.webp"),
    ("PRD-LNV-81", "Lenovo Yoga 920 2'si 1 Arada Laptop", "360 derece dönebilen dokunmatik ekran", 43999.00, "dizustu-bilgisayarlar", "/images/products/prod_81.webp"),
    ("PRD-DEL-82", "Dell XPS 13 9300 Ultra İnce Laptop", "4 kenarı çerçevesiz InfinityEdge ekran", 58999.00, "dizustu-bilgisayarlar", "/images/products/prod_82.webp"),
    ("PRD-APL-159", "Apple iPad Mini (2021) Starlight 256GB", "A15 Bionic çip, Liquid Retina ekran", 21999.00, "dizustu-bilgisayarlar", "/images/products/prod_159.webp"),
    ("PRD-SMS-160", "Samsung Galaxy Tab S8 Plus Gri", "12.4 inç Super AMOLED, S-Pen dahil", 26499.00, "dizustu-bilgisayarlar", "/images/products/prod_160.webp"),
    ("PRD-SMS-161", "Samsung Galaxy Tab Beyaz 128GB", "Hafif tasarım, uzun pil ömrü", 11499.00, "dizustu-bilgisayarlar", "/images/products/prod_161.webp"),

    # Akilli Telefonlar
    ("PRD-APL-123", "Apple iPhone 13 Pro 256GB Grafit", "ProMotion 120Hz ekran, üçlü kamera sistemi", 52999.00, "akilli-telefonlar", "/images/products/prod_123.webp"),
    ("PRD-APL-124", "Apple iPhone X 128GB Gümüş", "Super Retina OLED ekran, Face ID", 18999.00, "akilli-telefonlar", "/images/products/prod_124.webp"),
    ("PRD-APL-122", "Apple iPhone 6 64GB Uzay Grisi", "Klasik alüminyum kasa, Touch ID", 6499.00, "akilli-telefonlar", "/images/products/prod_122.webp"),
    ("PRD-APL-121", "Apple iPhone 5s 32GB Gümüş", "Kompakt tasarım, koleksiyonluk seri", 4299.00, "akilli-telefonlar", "/images/products/prod_121.webp"),
    ("PRD-SMS-133", "Samsung Galaxy S10 128GB Prizma Siyah", "Dinamik AMOLED ekran, kablosuz güç paylaşımı", 16999.00, "akilli-telefonlar", "/images/products/prod_133.webp"),
    ("PRD-SMS-132", "Samsung Galaxy S8 64GB Gece Siyahı", "Sonsuz ekran tasarımı, IP68 suya dayanıklı", 10499.00, "akilli-telefonlar", "/images/products/prod_132.webp"),
    ("PRD-SMS-131", "Samsung Galaxy S7 32GB Altın", "Çift piksel kamera teknolojisi", 7499.00, "akilli-telefonlar", "/images/products/prod_131.webp"),
    ("PRD-OPP-126", "Oppo F19 Pro Plus 5G 128GB", "AMOLED ekran, 50W hızlı flaş şarj", 14999.00, "akilli-telefonlar", "/images/products/prod_126.webp"),
    ("PRD-OPP-125", "Oppo A57 64GB Parlak Siyah", "33W SuperVOOC şarj, 5000mAh batarya", 8499.00, "akilli-telefonlar", "/images/products/prod_125.webp"),
    ("PRD-OPP-127", "Oppo K1 128GB Mavi", "Ekrandan parmak izi okuyuculu akıllı telefon", 9299.00, "akilli-telefonlar", "/images/products/prod_127.webp"),
    ("PRD-RLM-128", "Realme C35 128GB Yeşil", "50MP üçlü AI kamera, ince gövde", 7899.00, "akilli-telefonlar", "/images/products/prod_128.webp"),
    ("PRD-RLM-129", "Realme X 128GB İnci Beyazı", "Açılır selfie kameralı tam ekran tasarım", 9999.00, "akilli-telefonlar", "/images/products/prod_129.webp"),
    ("PRD-RLM-130", "Realme XT 128GB Mavi", "64MP dörtlü kamera, Super AMOLED", 10999.00, "akilli-telefonlar", "/images/products/prod_130.webp"),
    ("PRD-VIV-134", "Vivo S1 128GB Gökyüzü Mavisi", "32MP ön kamera, 4500mAh pil", 9499.00, "akilli-telefonlar", "/images/products/prod_134.webp"),
    ("PRD-VIV-135", "Vivo V9 64GB Siyah", "Yapay zeka destekli çift arka kamera", 7999.00, "akilli-telefonlar", "/images/products/prod_135.webp"),
    ("PRD-VIV-136", "Vivo X21 128GB Yakut Kırmızısı", "Ekran içi parmak izi sensörü", 11299.00, "akilli-telefonlar", "/images/products/prod_136.webp"),

    # Kulakliklar & Ses
    ("PRD-APL-100", "Apple AirPods Kablosuz Kulaklık", "H1 çip, şarj kutusuyla 24 saatten fazla pil", 5499.00, "kulakliklar", "/images/products/prod_100.webp"),
    ("PRD-APL-101", "Apple AirPods Max Gümüş", "Aktif gürültü engelleme, stüdyo kalitesinde ses", 26999.00, "kulakliklar", "/images/products/prod_101.webp"),
    ("PRD-BTS-107", "Beats Flex Kablosuz Kulak İçi Kulaklık", "Manyetik kulaklık uçları, 12 saat pil ömrü", 2499.00, "kulakliklar", "/images/products/prod_107.webp"),
    ("PRD-AMZ-99", "Amazon Echo Plus Akıllı Hoparlör", "Dahili Zigbee hub, 360 derece güçlü ses", 4899.00, "kulakliklar", "/images/products/prod_99.webp"),
    ("PRD-APL-103", "Apple HomePod Mini Uzay Grisi", "Kompakt akıllı hoparlör, S5 çip", 4499.00, "kulakliklar", "/images/products/prod_103.webp"),

    # Cevre Birimleri & Aksesuar
    ("PRD-APL-102", "Apple AirPower Kablosuz Şarj Pedi", "Aynı anda 3 cihazı kablosuz şarj etme", 3899.00, "cevre-birimleri", "/images/products/prod_102.webp"),
    ("PRD-APL-104", "Apple iPhone 20W USB-C Hızlı Şarj Adaptörü", "Orijinal hızlı şarj adaptörü", 899.00, "cevre-birimleri", "/images/products/prod_104.webp"),
    ("PRD-APL-105", "Apple MagSafe Harici Batarya", "Manyetik kablosuz powerbank", 3499.00, "cevre-birimleri", "/images/products/prod_105.webp"),
    ("PRD-APL-108", "Apple iPhone 12 MagSafe Silikon Kılıf Erik", "Mikrofiber iç astarlı orijinal kılıf", 1299.00, "cevre-birimleri", "/images/products/prod_108.webp"),
    ("PRD-ACC-109", "Profesyonel Teleskopik Monopod Tripod", "Alüminyum gövdeli kamera ve telefon tutucu", 749.00, "cevre-birimleri", "/images/products/prod_109.webp"),
    ("PRD-ACC-110", "Stüdyo Selfie Işığı & Telefon Tutucu", "Ayarlanabilir LED halka ışık seti", 1150.00, "cevre-birimleri", "/images/products/prod_110.webp"),
    ("PRD-ACC-111", "Katlanabilir Bluetooth Selfie Çubuğu", "Uzaktan kumandalı kompakt monopod", 499.00, "cevre-birimleri", "/images/products/prod_111.webp"),
    ("PRD-ACC-112", "Yayıncı Kamera & Işık Standı", "Ağır hizmet tipi stüdyo standı", 2899.00, "cevre-birimleri", "/images/products/prod_112.webp"),

    # Saatler (Akilli & Klasik Koleksiyon)
    ("PRD-APL-106", "Apple Watch Series 4 Altın 44mm", "EKG özellikli, suya dayanıklı akıllı saat", 11999.00, "akilli-saatler", "/images/products/prod_106.webp"),
    ("PRD-LNG-94", "Longines Master Collection Otomatik Saat", "Safir kristal cam, paslanmaz çelik kasa", 48999.00, "akilli-saatler", "/images/products/prod_94.webp"),
    ("PRD-RLX-95", "Rolex Cellini Date Siyah Kadran Saat", "18 ayar beyaz altın kasa, deri kayış", 115000.00, "akilli-saatler", "/images/products/prod_95.webp"),
    ("PRD-RLX-96", "Rolex Cellini Moonphase Saat", "Ay fazı göstergeli mekanik saat", 135000.00, "akilli-saatler", "/images/products/prod_96.webp"),
    ("PRD-RLX-97", "Rolex Datejust Klasik Çelik Saat", "Jubilee bilezik, otomatik mekanizma", 125000.00, "akilli-saatler", "/images/products/prod_97.webp"),
    ("PRD-RLX-98", "Rolex Submariner Dalgıç Saati", "300m su geçirmezlik, seramik bezel", 149000.00, "akilli-saatler", "/images/products/prod_98.webp"),
    ("PRD-IWC-190", "IWC Ingenieur Automatic Çelik Saat", "Entegre çelik bilezik, anti-manyetik kasa", 89000.00, "akilli-saatler", "/images/products/prod_190.webp"),
    ("PRD-WTC-93", "Klasik Kahverengi Deri Kayışlı Saat", "Günlük kullanıma uygun şık analog saat", 2499.00, "akilli-saatler", "/images/products/prod_93.webp"),
    ("PRD-WTC-191", "Elegance Moonphase Kadın Kol Saati", "Sedef kadranlı zarif kol saati", 4599.00, "akilli-saatler", "/images/products/prod_191.webp"),
    ("PRD-WTC-192", "Datejust Silver Kadın Kol Saati", "Paslanmaz çelik kordon, su geçirmez", 3899.00, "akilli-saatler", "/images/products/prod_192.webp"),
    ("PRD-WTC-193", "Gold Edition Kadın Kol Saati", "Altın kaplama şık tasarım saat", 3299.00, "akilli-saatler", "/images/products/prod_193.webp"),
    ("PRD-WTC-194", "Minimalist Rose Gold Kadın Saati", "İnce kasa, deri kordonlu saat", 2199.00, "akilli-saatler", "/images/products/prod_194.webp"),

    # Sony & Logitech
    ("PRD-SNY-PS5", "Sony PlayStation 5 Konsol + DualSense", "825GB Ultra Yüksek Hızlı SSD, 4K 120Hz oyun deneyimi", 24999.00, "cevre-birimleri", "/images/products/sony_ps5.png"),
    ("PRD-SNY-XPR1", "Sony Xperia 1 V 256GB Siyah", "4K HDR OLED 120Hz ekran, Zeiss optikli kamera", 41999.00, "akilli-telefonlar", "/images/products/sony_xperia.jpg"),
    ("PRD-SNY-A7M4", "Sony Alpha 7 Full-Frame Fotoğraf Makinesi", "33MP Exmor R CMOS sensör, 4K 60p video kaydı", 64999.00, "cevre-birimleri", "/images/products/sony_camera.jpg"),
    ("PRD-LOG-MXM3", "Logitech MX Master 3S Kablosuz Fare", "8000 DPI Darkfield sensör, sessiz tıklama", 3899.00, "cevre-birimleri", "/images/products/logitech_mx_master.jpg"),
    ("PRD-LOG-G512", "Logitech G512 Carbon RGB Mekanik Klavye", "GX Brown Switch, alüminyum alaşım kasa", 4299.00, "cevre-birimleri", "/images/products/logitech_g512.jpg"),
    ("PRD-LOG-G316", "Logitech G316 Kablosuz Mekanik Klavye", "Kompakt %98 düzen, Lightspeed bağlantı", 3699.00, "cevre-birimleri", "/images/products/logitech_g316.jpg"),
    ("PRD-LOG-GPRO", "Logitech G PRO TKL Oyuncu Klavyesi", "Espor sınıfı çıkarılabilir kablo, GX Blue", 4799.00, "cevre-birimleri", "/images/products/logitech_gpro.jpg"),
    ("PRD-LOG-C920", "Logitech C920 HD Pro Web Kamerası", "Full HD 1080p cam lens, çift stereo mikrofon", 2899.00, "cevre-birimleri", "/images/products/logitech_c920.jpg"),

    # Yeni Eklenen Amiral Gemisi & Populer Urunler
    ("PRD-APL-MBA15", "Apple MacBook Air 15 inç M3 Gece Yarısı", "M3 çip, 16GB birleşik bellek, 18 saat pil ömrü", 54999.00, "dizustu-bilgisayarlar", "/images/products/laptop-macbook.webp"),
    ("PRD-APL-IPDPRO", "Apple iPad Pro 13 inç M4 Uzay Siyahı", "Ultra Retina XDR Tandem OLED ekran, M4 çip", 56999.00, "dizustu-bilgisayarlar", "/images/products/tablet-ipad.webp"),
    ("PRD-ASU-ROG16", "Asus ROG Zephyrus G16 OLED Oyuncu Laptopu", "Intel Core Ultra 9, RTX 4070, 240Hz OLED ekran", 89999.00, "dizustu-bilgisayarlar", "/images/products/laptop-asus.webp"),
    ("PRD-LNV-THK1", "Lenovo ThinkPad X1 Carbon Gen 12", "Karbon fiber gövde, Intel Core Ultra 7, 32GB RAM", 72999.00, "dizustu-bilgisayarlar", "/images/products/laptop-lenovo.webp"),
    ("PRD-DEL-XPS15", "Dell XPS 15 OLED 32GB RAM İş İstasyonu", "15.6 inç 3.5K OLED dokunmatik ekran, RTX 4060", 78500.00, "dizustu-bilgisayarlar", "/images/products/laptop-dell.webp"),
    ("PRD-SMS-TABS9", "Samsung Galaxy Tab S9 Ultra 512GB", "14.6 inç Dynamic AMOLED 2X, IP68 suya dayanıklı S-Pen", 38999.00, "dizustu-bilgisayarlar", "/images/products/tablet-samsung.webp"),

    ("PRD-APL-IP16P", "Apple iPhone 16 Pro 256GB Çöl Titanyum", "A18 Pro çip, Kamera Denetimi, 4K 120fps Dolby Vision", 82999.00, "akilli-telefonlar", "/images/products/phone-iphone.webp"),
    ("PRD-APL-IP15", "Apple iPhone 15 128GB Mavi", "Dynamic Island, 48MP ana kamera, USB-C bağlantı", 49999.00, "akilli-telefonlar", "/images/products/phone-iphone.webp"),
    ("PRD-SMS-S24U", "Samsung Galaxy S24 Ultra 512GB Titanyum Gri", "Galaxy AI, 200MP kamera, entegre S-Pen", 68999.00, "akilli-telefonlar", "/images/products/phone-samsung.webp"),
    ("PRD-SMS-ZF6", "Samsung Galaxy Z Fold 6 512GB Gümüş", "7.6 inç katlanabilir AMOLED ekran, Snapdragon 8 Gen 3", 84999.00, "akilli-telefonlar", "/images/products/phone-samsung.webp"),
    ("PRD-XIA-14U", "Xiaomi 14 Ultra 512GB Leica Kamera", "Leica Summilux 1 inç sensör, 90W HyperCharge", 62999.00, "akilli-telefonlar", "/images/products/phone-oppo.webp"),
    ("PRD-GGL-PX9P", "Google Pixel 9 Pro 256GB Obsidian", "Google Tensor G4, Super Actua ekran, Gemini AI", 47999.00, "akilli-telefonlar", "/images/products/phone-oppo.webp"),

    ("PRD-SNY-WHXM5", "Sony WH-1000XM5 Kablosuz ANC Kulaklık", "8 mikrofonlu aktif gürültü engelleme, 30 saat pil", 13499.00, "kulakliklar", "/images/products/audio-airpods-max.webp"),
    ("PRD-SNY-WFXM5", "Sony WF-1000XM5 Kablosuz Kulak İçi Kulaklık", "Dinamik sürücü X, LDAC Hi-Res kablosuz ses", 9499.00, "kulakliklar", "/images/products/audio-airpods.webp"),
    ("PRD-APL-APP2", "Apple AirPods Pro (2. Nesil) USB-C", "H2 çip, 2 kat daha güçlü Aktif Gürültü Engelleme", 9299.00, "kulakliklar", "/images/products/audio-airpods.webp"),
    ("PRD-BOS-QCU", "Bose QuietComfort Ultra ANC Kulaklık", "Sürükleyici uzamsal ses, CustomTune kalibrasyon", 15999.00, "kulakliklar", "/images/products/audio-airpods-max.webp"),
    ("PRD-SEN-MOM4", "Sennheiser Momentum 4 Wireless Kulaklık", "60 saat pil ömrü, odyofil sınıfı 42mm sürücü", 12499.00, "kulakliklar", "/images/products/audio-airpods-max.webp"),
    ("PRD-JBL-CHG5", "JBL Charge 5 Taşınabilir Bluetooth Hoparlör", "IP67 suya/toza dayanıklı, 20 saat çalma süresi", 5999.00, "kulakliklar", "/images/products/audio-speaker.webp"),

    ("PRD-APL-AWU2", "Apple Watch Ultra 2 49mm Titanyum", "3000 nit parlaklık, çift frekanslı GPS, 72 saat pil", 39999.00, "akilli-saatler", "/images/products/watch-apple.webp"),
    ("PRD-GRM-FNX7", "Garmin Fenix 7 Pro Solar GPS Saat", "Güneş enerjili safir cam, çoklu bant GPS", 31999.00, "akilli-saatler", "/images/products/watch-apple.webp"),

    ("PRD-LOG-SL2", "Logitech G PRO X Superlight 2 Kablosuz Fare", "60g ultra hafif tasarım, HERO 2 32K sensör", 5499.00, "cevre-birimleri", "/images/products/logitech_mx_master.jpg"),
    ("PRD-LOG-MXKS", "Logitech MX Keys S Kablosuz Klavye", "Akıllı arka aydınlatma, çoklu cihaz geçişi", 4499.00, "cevre-birimleri", "/images/products/logitech_g512.jpg")
]

VARIANTS = [
    ("256GB / Uzay Grisi", 1.08),
    ("512GB / Gümüş", 1.18),
    ("Pro Edition", 1.12),
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

    # 49 ana urunu ve onlarin gercekci varyantlarini ekleyerek 150+ urune ulas
    for sku, name, desc, price, catLink, imgUrl in CATALOG:
        cid = catMap.get(catLink)
        if not cid:
            continue

        # Ana urun
        cur.execute("""
            INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, 20.00, TRUE)
            ON CONFLICT (product_code) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name
            RETURNING id;
        """, (cid, sku, name, desc, imgUrl, price))
        res = cur.fetchone()
        if res:
            cur.execute("""
                INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold, last_restocked_at)
                VALUES (%s, %s, 0, 10, %s) ON CONFLICT (product_id) DO NOTHING;
            """, (res[0], random.randint(40, 120), randomDate(60)))

        # Ayni urunun resmi garantili farkli donanim/paket varyantlari (150+ urun sarti icin)
        for idx, (varName, mult) in enumerate(VARIANTS):
            varSku = f"{sku}-V{idx+1}"
            varTitle = f"{name} ({varName})"
            varPrice = round(price * mult, 2)
            cur.execute("""
                INSERT INTO products (category_id, product_code, name, description, image_url, base_price, tax_rate, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, 20.00, TRUE)
                ON CONFLICT (product_code) DO NOTHING RETURNING id;
            """, (cid, varSku, varTitle, desc, imgUrl, varPrice))
            vRes = cur.fetchone()
            if vRes:
                cur.execute("""
                    INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold, last_restocked_at)
                    VALUES (%s, %s, 0, 10, %s) ON CONFLICT (product_id) DO NOTHING;
                """, (vRes[0], random.randint(30, 90), randomDate(60)))

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

    cur.execute("UPDATE inventory SET stock_quantity = 2 WHERE product_id IN (SELECT id FROM products LIMIT 5);")
    cur.execute("UPDATE inventory SET stock_quantity = 0 WHERE product_id IN (SELECT id FROM products OFFSET 5 LIMIT 3);")

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
