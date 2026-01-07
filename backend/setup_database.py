#!/usr/bin/env python3
"""
Database setup script for AI Accounting application.
Creates database if it doesn't exist, runs migrations, and seeds initial data.
"""
import os
import sys
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'ai_accounting')
DB_PORT = int(os.getenv('DB_PORT', 3306))

def create_database():
    """Create database if it doesn't exist"""
    print(f"🔧 Connecting to MySQL server at {DB_HOST}:{DB_PORT}...")
    
    try:
        # Connect without specifying database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute(f"SHOW DATABASES LIKE '{DB_NAME}'")
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Database '{DB_NAME}' already exists")
        else:
            print(f"📦 Creating database '{DB_NAME}'...")
            cursor.execute(f"CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Database '{DB_NAME}' created successfully")
        
        cursor.close()
        connection.close()
        return True
        
    except pymysql.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_migrations():
    """Run Django migrations"""
    print("\n🔄 Running Django migrations...")
    os.system("python manage.py makemigrations")
    result = os.system("python manage.py migrate")
    if result == 0:
        print("✅ Migrations completed successfully")
        return True
    else:
        print("❌ Migrations failed")
        return False

def seed_data():
    """Seed initial data"""
    print("\n🌱 Seeding initial data...")
    
    # Seed modules
    print("\n📦 Seeding modules...")
    result = os.system("python seed_modules_db.py")
    if result != 0:
        print("❌ Module seeding failed")
        return False
    
    # Seed roles
    print("\n👥 Seeding roles...")
    result = os.system("python seed_roles.py")
    if result != 0:
        print("❌ Role seeding failed")
        return False
    
    print("✅ Data seeding completed successfully")
    return True

def main():
    """Main setup function"""
    print("=" * 60)
    print("🚀 AI Accounting Database Setup")
    print("=" * 60)
    
    # Step 1: Create database
    if not create_database():
        print("\n❌ Setup failed at database creation")
        sys.exit(1)
    
    # Step 2: Run migrations
    if not run_migrations():
        print("\n❌ Setup failed at migrations")
        sys.exit(1)
    
    # Step 3: Seed data
    if not seed_data():
        print("\n❌ Setup failed at data seeding")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Database setup completed successfully!")
    print("=" * 60)
    print("\n🎉 You can now run: python manage.py runserver")

if __name__ == '__main__':
    main()
