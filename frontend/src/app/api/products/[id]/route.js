import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const res = await query(
      `SELECT 
        p.id, p.product_code, p.name, p.description, p.image_url, 
        p.base_price, p.tax_rate, p.is_active,
        c.id AS category_id, c.name AS category_name,
        i.stock_quantity, i.reorder_threshold
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1`,
      [Number(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ product: res.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { isActive } = await request.json();

    const res = await query(
      `UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active`,
      [Boolean(isActive), Number(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: res.rows[0],
      message: res.rows[0].is_active ? "Ürün tekrar aktifleştirildi." : "Ürün pasife alındı.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
