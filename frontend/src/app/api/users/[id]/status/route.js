import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Geçersiz hesap durumu." }, { status: 400 });
    }

    const res = await query(
      `UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, status`,
      [status, Number(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: res.rows[0],
      message: `${res.rows[0].full_name} durumu ${status} yapıldı.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
