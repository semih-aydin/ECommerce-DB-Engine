import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyCritical = searchParams.get("critical") === "true";

    let sql = `
      SELECT 
        p.id, p.product_code, p.name, p.description, p.image_url, p.base_price, p.tax_rate, p.is_active,
        c.id AS category_id, c.name AS category_name,
        i.stock_quantity, i.reorder_threshold, i.last_restocked_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `;

    if (onlyCritical) {
      sql += ` AND i.stock_quantity <= i.reorder_threshold`;
    }

    sql += ` ORDER BY CASE WHEN p.product_code NOT LIKE '%-V%' THEN 0 ELSE 1 END, p.id DESC`;

    const prodRes = await query(sql);
    const catRes = await query(`SELECT id, name, parent_id FROM categories ORDER BY name ASC`);

    return NextResponse.json({
      products: prodRes.rows,
      categories: catRes.rows,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, productCode, categoryId, basePrice, stockQuantity, description } =
      await request.json();

    if (!name || !productCode || !categoryId || Number(basePrice) <= 0) {
      return NextResponse.json(
        { error: "Ürün adı, kodu, kategori ve 0'dan büyük fiyat zorunludur." },
        { status: 400 }
      );
    }

    const prodRes = await query(
      `INSERT INTO products (category_id, product_code, name, description, base_price, tax_rate, is_active)
       VALUES ($1, $2, $3, $4, $5, 20.00, TRUE)
       RETURNING id, product_code, name`,
      [
        Number(categoryId),
        productCode.trim().toUpperCase(),
        name.trim(),
        description?.trim() || "AydınStore yeni ürün",
        Number(basePrice),
      ]
    );

    const newProduct = prodRes.rows[0];
    await query(
      `INSERT INTO inventory (product_id, stock_quantity, reserved_quantity, reorder_threshold, last_restocked_at)
       VALUES ($1, $2, 0, 10, CURRENT_TIMESTAMP)`,
      [newProduct.id, Math.max(0, parseInt(stockQuantity || "15", 10))]
    );

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: `${newProduct.name} (${newProduct.product_code}) eklendi.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
