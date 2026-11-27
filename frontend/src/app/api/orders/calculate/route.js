import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        tax_total: 0,
        shipping_fee: 0,
        total_amount: 0,
        free_shipping_qualified: false,
      });
    }

    // PL/pgSQL fonksiyonu ile canli sepet hesabi
    const res = await query(
      `SELECT * FROM fn_calculate_cart_total($1::jsonb)`,
      [JSON.stringify(items)]
    );

    return NextResponse.json(res.rows[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
