"""
Script to create admin user with full permissions using raw SQL
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import uuid
from django.db import connection
from django.contrib.auth.hashers import make_password
from django.utils import timezone

def create_admin():
    email = 'admin@gmail.com'
    username = 'admin'
    password = 'admin123'
    company_name = 'Admin Company'
    tid = str(uuid.uuid4())
    now = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Hash the password
    password_hash = make_password(password)
    
    with connection.cursor() as cursor:
        # Create tenant first
        cursor.execute("""
            INSERT IGNORE INTO tenants (id, name, created_at) 
            VALUES (%s, %s, %s)
        """, [tid, company_name, now])
        
        # Delete existing admin user if exists
        cursor.execute("DELETE FROM users WHERE username = %s OR email = %s", [username, email])
        
        # Create admin user with raw SQL
        cursor.execute("""
            INSERT INTO users (
                username, password, email, company_name, selected_plan,
                tenant_id, is_active, is_superuser, is_staff,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, 1, 1, 1,
                %s, %s
            )
        """, [username, password_hash, email, company_name, 'Enterprise',
              tid, now, now])
        
        connection.commit()
    
    print("\n" + "="*50)
    print("ADMIN USER CREATED SUCCESSFULLY!")
    print("="*50)
    print(f"Email: {email}")
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"Company: {company_name}")
    print(f"Plan: Enterprise (Full Access)")
    print("="*50)
    print("\nThis user has OWNER permissions = ALL sidebar menus visible!")
    print("="*50)

if __name__ == '__main__':
    create_admin()
