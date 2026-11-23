import os
import sys
from pathlib import Path
import psycopg2

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "ecommerce_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "postgres")
DATABASE_URL = os.getenv("DATABASE_URL")

SQL_FILES = [
    "01_init_schema.sql",
    "02_views.sql",
    "03_functions.sql",
    "04_procedures.sql",
    "05_triggers.sql",
    "06_seed_manual.sql"
]

def connectDb():
    try:
        if DATABASE_URL:
            return psycopg2.connect(DATABASE_URL)
        return psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASS
        )
    except Exception as e:
        print("DB baglanti hatasi:", e)
        sys.exit(1)

def main():
    sqlDir = Path(__file__).resolve().parent.parent / "sql"
    conn = connectDb()
    conn.autocommit = True
    cur = conn.cursor()

    for fileName in SQL_FILES:
        filePath = sqlDir / fileName
        if not filePath.exists():
            print(f"Bulunamadi, atlaniyor: {fileName}")
            continue

        try:
            with open(filePath, "r", encoding="utf-8") as f:
                cur.execute(f.read())
            print(f"[OK] {fileName}")
        except Exception as e:
            print(f"[HATA] {fileName}: {e}")
            cur.close()
            conn.close()
            sys.exit(1)

    cur.close()
    conn.close()
    print("Kurulum bitti.")

if __name__ == "__main__":
    main()
