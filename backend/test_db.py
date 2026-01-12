import os
from dotenv import load_dotenv
import psycopg2

load_dotenv(override=True)

url = os.getenv("DATABASE_URL")
print("URL:", url)

conn = psycopg2.connect(url)
print("CONNECTED OK")
conn.close()
