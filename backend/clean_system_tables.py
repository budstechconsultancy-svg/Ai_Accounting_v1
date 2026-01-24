
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def nuke_django_tables():
    system_tables = [
        'django_content_type',
        'auth_permission',
        'auth_group',
        'auth_group_permissions',
        'auth_user_user_permissions',
        'auth_user_groups',
        'django_admin_log', 
        'django_session',
        'django_migrations' # We already truncated this, but dropping is fine too
    ]
    
    with connection.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
        for table in system_tables:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table};")
                print(f"Dropped {table}")
            except Exception as e:
                print(f"Error dropping {table}: {e}")
        cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

if __name__ == "__main__":
    nuke_django_tables()
