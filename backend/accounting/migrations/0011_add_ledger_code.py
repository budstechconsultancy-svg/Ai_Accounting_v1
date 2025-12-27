from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0010_add_parent_ledger_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='masterledger',
            name='ledger_code',
            field=models.CharField(blank=True, help_text='Auto-generated code based on hierarchy position', max_length=50, null=True, unique=True),
        ),
    ]
