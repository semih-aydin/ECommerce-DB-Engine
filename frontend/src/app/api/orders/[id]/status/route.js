import { NextResponse } from "next/server";
import { query } from "@/lib/db";

const NEXT_STATUS = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    const body = await request.json().catch(() => ({}));

    const existing = await query(
      `SELECT id, order_code, status FROM orders WHERE id = $1`,
      [orderId]
    );

    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const order = existing.rows[0];

    if (body.shipmentStatus === "RETURNED" && order.status === "DELIVERED") {
      await query(
        `UPDATE shipments SET status = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE order_id = $1`,
        [orderId]
      );
      return NextResponse.json({
        success: true,
        message: `${order.order_code} kargo durumu RETURNED (İade) olarak güncellendi.`,
      });
    }

    const targetStatus = NEXT_STATUS[order.status];

    if (!targetStatus) {
      return NextResponse.json(
        { error: `${order.status} durumundaki sipariş bir sonraki aşamaya geçirilemez.` },
        { status: 400 }
      );
    }

    await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [targetStatus, orderId]
    );

    if (targetStatus === "SHIPPED") {
      const shipCheck = await query(`SELECT id FROM shipments WHERE order_id = $1`, [orderId]);
      if (shipCheck.rowCount === 0) {
        const tracking = `TRK-${Date.now().toString().slice(-8)}-${orderId}`;
        await query(
          `INSERT INTO shipments (order_id, tracking_number, carrier, status, shipped_at)
           VALUES ($1, $2, 'Yurtiçi Kargo', 'IN_TRANSIT', CURRENT_TIMESTAMP)`,
          [orderId, tracking]
        );
      } else {
        await query(
          `UPDATE shipments
           SET status = 'IN_TRANSIT', shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $1`,
          [orderId]
        );
      }
    } else if (targetStatus === "DELIVERED") {
      await query(
        `UPDATE shipments
         SET status = 'DELIVERED', delivered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $1`,
        [orderId]
      );
    }

    return NextResponse.json({
      success: true,
      newStatus: targetStatus,
      message: `${order.order_code} durumu ${targetStatus} olarak güncellendi.`,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
