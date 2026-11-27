import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { categoryId, discountRate } = await request.json();

    await query(`CALL sp_apply_bulk_discount($1, $2)`, [
      Number(categoryId),
      Number(discountRate),
    ]);

    return NextResponse.json({
      success: true,
      message: `%${discountRate} toplu indirim uygulandi ve audit loglari olusturuldu.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
