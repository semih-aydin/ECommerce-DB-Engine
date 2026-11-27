import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let sql = `
      SELECT 
        o.id, o.order_code, o.status, o.subtotal, o.shipping_fee, o.total_amount, 
        o.shipping_address, o.created_at,
        u.full_name AS customer_name, u.email AS customer_email,
        p.payment_method, p.payment_status,
        s.tracking_number, s.carrier, s.status AS shipment_status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN shipments s ON o.id = s.order_id
    `;
    const params = [];

    if (status && status !== "ALL") {
      sql += ` WHERE o.status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY o.created_at DESC LIMIT 60`;

    const res = await query(sql, params);
    return NextResponse.json({ orders: res.rows });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, items, paymentMethod, shippingAddress, simulateFail } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Kullanici ve en az 1 urun secmelisiniz." },
        { status: 400 }
      );
    }

    if (simulateFail) {
      const calcRes = await query(
        `SELECT * FROM fn_calculate_cart_total($1::jsonb)`,
        [JSON.stringify(items)]
      );
      const totals = calcRes.rows[0] || { subtotal: 0, shipping_fee: 0, total_amount: 1 };
      const failCode = `ORD-FAIL-${Date.now().toString().slice(-6)}`;
      const failTxn = `TXN-FAIL-${Date.now().toString().slice(-8)}`;

      const ordRes = await query(
        `INSERT INTO orders (order_code, user_id, status, subtotal, shipping_fee, total_amount, shipping_address)
         VALUES ($1, $2, 'CANCELLED', $3, $4, $5, $6) RETURNING id`,
        [
          failCode,
          userId,
          totals.subtotal,
          totals.shipping_fee,
          Math.max(1, Number(totals.total_amount)),
          shippingAddress || "Trabzon Merkez",
        ]
      );

      await query(
        `INSERT INTO payments (order_id, payment_method, transaction_id, amount, payment_status)
         VALUES ($1, $2, $3, $4, 'FAILED')`,
        [
          ordRes.rows[0].id,
          paymentMethod || "CREDIT_CARD",
          failTxn,
          Math.max(1, Number(totals.total_amount)),
        ]
      );

      return NextResponse.json(
        { error: `Ödeme banka/sağlayıcı tarafından reddedildi (FAILED). Kayıt kodu: ${failCode}` },
        { status: 402 }
      );
    }

    // Stored Procedure cagrisi: FOR UPDATE kilitleme + stok kontrol + siparis
    const res = await query(
      `CALL sp_create_order($1, $2::jsonb, $3, $4, NULL, NULL)`,
      [
        userId,
        JSON.stringify(items),
        paymentMethod || "CREDIT_CARD",
        shippingAddress || "Trabzon Merkez",
      ]
    );

    const out = res.rows[0] || {};
    return NextResponse.json({
      success: true,
      orderId: out.p_order_id,
      orderCode: out.p_order_code,
      message: `Siparis olusturuldu: ${out.p_order_code}`,
    });
  } catch (err) {
    // DB trigger veya SP RAISE EXCEPTION hatasini yakala
    console.error("Siparis olusturma hatasi:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
