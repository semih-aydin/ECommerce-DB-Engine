import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Admin panelinden iptal edildi";

    await query(`CALL sp_cancel_order($1, $2)`, [Number(id), reason]);

    return NextResponse.json({
      success: true,
      message: "Siparis iptal edildi, stoklar depoya iade edildi.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
