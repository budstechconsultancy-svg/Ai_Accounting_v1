
import os
import django
from django.db import connection
from django.conf import settings
import traceback

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.apps import apps

def create_missing_tables():
    print("Checking for missing tables...")
    
    # Get all installed apps
    for app_config in apps.get_app_configs():
        print(f"Scanning app: {app_config.label}")
        for model in app_config.get_models():
            table_name = model._meta.db_table
            
            with connection.cursor() as cursor:
                # Check if table exists (robustly)
                cursor.execute(f"SHOW TABLES LIKE '{table_name}'")
                exists = cursor.fetchone() is not None
                
                if not exists:
                    print(f"Creating missing table: {table_name} for model {model.__name__}")
                    
                    with connection.schema_editor() as schema_editor:
                        try:
                            schema_editor.create_model(model)
                            print(f"  [OK] Created {table_name}")
                        except Exception as e:
                            print(f"  [ERROR] Failed to create {table_name}: {e}")
                            # traceback.print_exc() # Optional: noisy
                else:
                    # print(f"Table exists: {table_name}") # Optional: noisy
                    pass

if __name__ == "__main__":
    create_missing_tables()
