import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Temel KPI'lar
    const kpiRes = await query(`
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'CANCELLED') AS total_revenue,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM orders WHERE status IN ('PENDING', 'PROCESSING')) AS active_orders,
        (SELECT COUNT(*) FROM vw_inventory_critical_status) AS critical_stock_count,
        (SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER' AND status = 'ACTIVE') AS customer_count
    `);

    // Aylik satis analitigi view'i (en guncel 12 ay)
    const salesRes = await query(`
      SELECT * FROM (
        SELECT 
          sales_month,
          TO_CHAR(sales_month, 'YYYY-MM') AS month,
          total_orders,
          successful_orders,
          monthly_revenue,
          cumulative_revenue,
          previous_month_revenue,
          mom_growth_rate,
          avg_order_value
        FROM vw_monthly_sales_analytics
        ORDER BY sales_month DESC
        LIMIT 12
      ) latest_months
      ORDER BY sales_month ASC
    `);

    // Kritik stok view'i
    const criticalRes = await query(`
      SELECT * FROM vw_inventory_critical_status
      ORDER BY stock_quantity ASC
      LIMIT 8
    `);

    // En cok harcayan musteriler view'i
    const topCustomersRes = await query(`
      SELECT * FROM vw_customer_summary
      ORDER BY total_spent DESC
      LIMIT 6
    `);

    // Son siparisler
    const recentOrdersRes = await query(`
      SELECT o.id, o.order_code, o.status, o.total_amount, o.created_at, u.full_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    return NextResponse.json({
      kpis: kpiRes.rows[0],
      monthlySales: salesRes.rows,
      criticalInventory: criticalRes.rows,
      topCustomers: topCustomersRes.rows,
      recentOrders: recentOrdersRes.rows,
    });
  } catch (err) {
    console.error("Dashboard API hatasi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
