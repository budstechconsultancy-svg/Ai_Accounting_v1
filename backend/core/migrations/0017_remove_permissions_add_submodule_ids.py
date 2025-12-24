# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0016_remove_tenantuser_roles_tenantuser_role'),
    ]

    operations = [
        # Add selected_submodule_ids field to TenantUser
        migrations.AddField(
            model_name='tenantuser',
            name='selected_submodule_ids',
            field=models.JSONField(blank=True, default=list),
        ),
        
        # Remove role field from TenantUser
        migrations.RemoveField(
            model_name='tenantuser',
            name='role',
        ),
        
        # Remove roles field from User (ManyToMany)
        migrations.RemoveField(
            model_name='user',
            name='roles',
        ),
        
        # Drop permission and role tables using raw SQL
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS `role_submodule_permissions`;',
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS `permission_submodules`;',
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS `permission_modules`;',
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS `roles`;',
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS `core_user_roles`;',  # ManyToMany table
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
