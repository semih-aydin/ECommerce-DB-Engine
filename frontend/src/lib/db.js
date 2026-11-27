import { Pool } from "pg";

// PostgreSQL baglanti havuzu
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/ecommerce_db",
});

export async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("DB sorgu hatasi:", err.message);
    throw err;
  }
}

export default pool;
