
import MySQLdb
import os

try:
    db = MySQLdb.connect(host="localhost", user="root", passwd="Ulaganathan123")
    cursor = db.cursor()
    cursor.execute("CREATE DATABASE IF NOT EXISTS ai_accounting")
    print("Database created or already exists.")
except Exception as e:
    print(f"Error: {e}")
