// Urun adina ve kategorisine gore gercek studyo gorseli eslestirir
export function getProductImage(name = "", categoryName = "") {
  const n = name.toLowerCase();
  const c = categoryName.toLowerCase();

  if (n.includes("macbook")) return "/images/products/laptop-macbook.webp";
  if (n.includes("asus")) return "/images/products/laptop-asus.webp";
  if (n.includes("dell") && (n.includes("xps") || c.includes("bilgisayar")))
    return "/images/products/laptop-dell.webp";
  if (n.includes("lenovo") || n.includes("msi") || n.includes("acer"))
    return "/images/products/laptop-lenovo.webp";

  if (n.includes("iphone")) return "/images/products/phone-iphone.webp";
  if (n.includes("samsung") && c.includes("telefon"))
    return "/images/products/phone-samsung.webp";
  if (n.includes("xiaomi") || n.includes("pixel") || c.includes("telefon"))
    return "/images/products/phone-oppo.webp";

  if (n.includes("ipad")) return "/images/products/tablet-ipad.webp";
  if (n.includes("tab")) return "/images/products/tablet-samsung.webp";

  if (n.includes("airpods max") || n.includes("sony wh") || n.includes("bose") || n.includes("sennheiser") || n.includes("oyuncu kulakl"))
    return "/images/products/audio-airpods-max.webp";
  if (n.includes("airpods") || n.includes("wf-1000") || n.includes("tws") || c.includes("kulak"))
    return "/images/products/audio-airpods.webp";
  if (n.includes("jbl") || n.includes("hoparlör"))
    return "/images/products/audio-speaker.webp";

  if (n.includes("watch") || n.includes("garmin") || n.includes("saat") || c.includes("saat"))
    return "/images/products/watch-apple.webp";

  if (c.includes("dizüstü") || c.includes("bilgisayar"))
    return "/images/products/laptop-dell.webp";

  return "/images/products/accessory-charger.webp";
}

// Urun adindan marka ismini ayiklar
export function extractBrand(name = "") {
  const knownBrands = [
    "Apple", "Samsung", "Sony", "Asus", "Dell", "Lenovo", "MSI", "Acer",
    "Xiaomi", "Google", "Logitech", "Razer", "SteelSeries", "Anker",
    "Bose", "Sennheiser", "JBL", "Garmin", "Huawei", "Oppo", "Realme",
    "Vivo", "Beats", "Amazon", "Longines", "Rolex", "IWC",
    "Corsair", "HyperX", "Baseus", "Spigen", "UGreen", "Kingston", "SanDisk", "TP-Link"
  ];
  for (const b of knownBrands) {
    if (name.toLowerCase().startsWith(b.toLowerCase())) {
      return { brand: b, title: name.slice(b.length).trim() };
    }
  }
  return { brand: "AydınTech", title: name };
}
