import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const sql = includeAll
      ? `SELECT id, full_name, email, phone, address, role, status, created_at,
                fn_get_customer_lifetime_value(id) AS lifetime_value
         FROM users
         WHERE role = 'CUSTOMER'
         ORDER BY id DESC`
      : `SELECT id, full_name, email, address, status,
                fn_get_customer_lifetime_value(id) AS lifetime_value
         FROM users
         WHERE role = 'CUSTOMER' AND status = 'ACTIVE'
         ORDER BY full_name ASC`;

    const res = await query(sql);
    return NextResponse.json({ users: res.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { fullName, email, phone, address } = await request.json();

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "Ad Soyad ve e-posta zorunludur." },
        { status: 400 }
      );
    }

    const res = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, address, role, status)
       VALUES ($1, '$2b$12$webcreateduserhash123456789012345678901234567890', $2, $3, $4, 'CUSTOMER', 'ACTIVE')
       RETURNING id, full_name, email, status`,
      [email.trim().toLowerCase(), fullName.trim(), phone?.trim() || null, address?.trim() || "Ortahisar, Trabzon"]
    );

    return NextResponse.json({
      success: true,
      user: res.rows[0],
      message: `${res.rows[0].full_name} müşteri olarak eklendi.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
