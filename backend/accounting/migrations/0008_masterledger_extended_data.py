# Generated manually for adding extended_data field to MasterLedger

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0007_journalentry_masterledger_masterledgergroup_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='masterledger',
            name='extended_data',
            field=models.JSONField(
                blank=True,
                help_text='Group-specific fields (e.g., cashLocation for Cash group, loanAccountNumber for Secured Loans)',
                null=True
            ),
        ),
    ]
