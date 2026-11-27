import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { amount } = await request.json();
    const qty = parseInt(amount, 10);

    if (!qty || qty <= 0) {
      return NextResponse.json({ error: "Eklenecek adet pozitif olmali" }, { status: 400 });
    }

    const res = await query(
      `UPDATE inventory 
       SET stock_quantity = stock_quantity + $1, 
           last_restocked_at = CURRENT_TIMESTAMP, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE product_id = $2 
       RETURNING stock_quantity`,
      [qty, Number(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Stok kaydi bulunamadi" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      newStock: res.rows[0].stock_quantity,
      message: `Stoka ${qty} adet eklendi.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
