import os
import json
import psycopg2

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ecommerce_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")
DATABASE_URL = os.getenv("DATABASE_URL")

def connectDb():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
    )

passed = 0
failed = 0

def check(name, ok, err=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"[PASS] {name}")
    else:
        failed += 1
        print(f"[FAIL] {name} -> {err}")

def main():
    conn = connectDb()
    conn.autocommit = True
    cur = conn.cursor()

    # 1. Trigger: yetersiz stok engeli
    try:
        cur.execute("SELECT p.id, i.stock_quantity FROM products p JOIN inventory i ON p.id = i.product_id WHERE i.stock_quantity > 0 LIMIT 1;")
        pid, stock = cur.fetchone()

        cur.execute("""
            INSERT INTO orders (order_code, user_id, status, subtotal, shipping_fee, total_amount, shipping_address)
            VALUES ('TEST-ORD-001', 1, 'PENDING', 100.0, 0.0, 100.0, 'Test Adres') RETURNING id;
        """)
        oid = cur.fetchone()[0]

        blocked = False
        try:
            cur.execute("""
                INSERT INTO order_items (order_id, product_id, unit_price, quantity, line_total)
                VALUES (%s, %s, 100.0, %s, 100.0 * %s);
            """, (oid, pid, stock + 50, stock + 50))
        except Exception:
            blocked = True

        check("trg_check_and_reduce_stock", blocked)
        cur.execute("DELETE FROM orders WHERE id = %s;", (oid,))
    except Exception as e:
        check("trg_check_and_reduce_stock", False, str(e))

    # 2. Trigger: fiyat degisimi audit log
    try:
        cur.execute("SELECT id, base_price FROM products LIMIT 1;")
        pid, oldPrice = cur.fetchone()
        newPrice = float(oldPrice) + 100.00

        cur.execute("UPDATE products SET base_price = %s WHERE id = %s;", (newPrice, pid))
        cur.execute("SELECT action FROM audit_logs WHERE entity_name = 'products' AND entity_id = %s ORDER BY changed_at DESC LIMIT 1;", (pid,))
        row = cur.fetchone()
        check("trg_audit_product_price_change", row is not None and row[0] == "PRICE_UPDATE")

        cur.execute("UPDATE products SET base_price = %s WHERE id = %s;", (oldPrice, pid))
    except Exception as e:
        check("trg_audit_product_price_change", False, str(e))

    # 3. Trigger: odeme sonrasi siparis durumu
    try:
        cur.execute("""
            INSERT INTO orders (order_code, user_id, status, subtotal, shipping_fee, total_amount, shipping_address)
            VALUES ('TEST-ORD-PAY', 1, 'PENDING', 250.0, 0.0, 250.0, 'Test Adres') RETURNING id;
        """)
        payOid = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO payments (order_id, payment_method, transaction_id, amount, payment_status)
            VALUES (%s, 'CREDIT_CARD', 'TXN-TEST-1234', 250.0, 'SUCCESS');
        """, (payOid,))

        cur.execute("SELECT status FROM orders WHERE id = %s;", (payOid,))
        check("trg_update_order_status_on_payment", cur.fetchone()[0] == "PROCESSING")

        cur.execute("DELETE FROM payments WHERE order_id = %s;", (payOid,))
        cur.execute("DELETE FROM orders WHERE id = %s;", (payOid,))
    except Exception as e:
        check("trg_update_order_status_on_payment", False, str(e))

    # 4. Procedure: sp_create_order
    spOrderId = None
    try:
        cur.execute("SELECT p.id, i.stock_quantity FROM products p JOIN inventory i ON p.id = i.product_id WHERE i.stock_quantity >= 5 LIMIT 1;")
        targetPid, startStock = cur.fetchone()

        payload = json.dumps([{"product_id": targetPid, "quantity": 2}])
        cur.execute("CALL sp_create_order(1, %s::jsonb, 'CREDIT_CARD', 'Test Adres', NULL, NULL);", (payload,))

        cur.execute("SELECT id FROM orders WHERE user_id = 1 ORDER BY id DESC LIMIT 1;")
        spOrderId = cur.fetchone()[0]

        cur.execute("SELECT stock_quantity FROM inventory WHERE product_id = %s;", (targetPid,))
        endStock = cur.fetchone()[0]

        check("sp_create_order", spOrderId is not None and (startStock - endStock == 2))
    except Exception as e:
        check("sp_create_order", False, str(e))

    # 5. Procedure: sp_cancel_order
    try:
        if spOrderId:
            cur.execute("CALL sp_cancel_order(%s, 'Test iptal');", (spOrderId,))
            cur.execute("SELECT status FROM orders WHERE id = %s;", (spOrderId,))
            oStatus = cur.fetchone()[0]
            cur.execute("SELECT payment_status FROM payments WHERE order_id = %s;", (spOrderId,))
            pStatus = cur.fetchone()[0]
            check("sp_cancel_order", oStatus == "CANCELLED" and pStatus == "REFUNDED")
        else:
            check("sp_cancel_order", False, "Siparis olusturulamadi")
    except Exception as e:
        check("sp_cancel_order", False, str(e))

    # 6. Procedure: sp_apply_bulk_discount
    try:
        cur.execute("SELECT id FROM categories WHERE parent_id IS NOT NULL LIMIT 1;")
        catId = cur.fetchone()[0]
        cur.execute("CALL sp_apply_bulk_discount(%s, 10.0);", (catId,))
        check("sp_apply_bulk_discount", True)
    except Exception as e:
        check("sp_apply_bulk_discount", False, str(e))

    # 7. Fonksiyonlar ve View'lar
    try:
        cur.execute("SELECT * FROM fn_calculate_cart_total(%s::jsonb);", (json.dumps([{"product_id": 1, "quantity": 1}]),))
        check("fn_calculate_cart_total", cur.fetchone() is not None)

        cur.execute("SELECT fn_get_customer_lifetime_value(1);")
        check("fn_get_customer_lifetime_value", cur.fetchone()[0] is not None)

        cur.execute("SELECT COUNT(*) FROM vw_customer_summary;")
        check("vw_customer_summary", cur.fetchone()[0] >= 0)

        cur.execute("SELECT COUNT(*) FROM vw_inventory_critical_status;")
        check("vw_inventory_critical_status", cur.fetchone()[0] >= 0)

        cur.execute("SELECT COUNT(*) FROM vw_monthly_sales_analytics;")
        check("vw_monthly_sales_analytics", cur.fetchone()[0] >= 0)
    except Exception as e:
        check("functions_and_views", False, str(e))

    cur.close()
    conn.close()

    print(f"\nSonuc: {passed} basarili, {failed} basarisiz")

if __name__ == "__main__":
    main()
