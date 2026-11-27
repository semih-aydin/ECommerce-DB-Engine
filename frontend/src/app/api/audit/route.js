import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const res = await query(`
      SELECT id, entity_name, entity_id, action, old_value, new_value, changed_by, changed_at
      FROM audit_logs
      ORDER BY changed_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ logs: res.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
