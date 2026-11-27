import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { basePrice } = await request.json();
    const numericPrice = Number(basePrice);

    if (!numericPrice || numericPrice <= 0) {
      return NextResponse.json({ error: "Fiyat 0'dan buyuk olmali" }, { status: 400 });
    }

    // base_price degisince DB'deki trg_audit_product_price_change otomatik audit_logs'a yazar
    const res = await query(
      `UPDATE products SET base_price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, base_price`,
      [numericPrice, Number(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Urun bulunamadi" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: res.rows[0],
      message: "Fiyat guncellendi ve audit trigger tetiklendi.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
