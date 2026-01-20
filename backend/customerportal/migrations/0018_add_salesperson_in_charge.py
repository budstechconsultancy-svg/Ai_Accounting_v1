# Generated manually to resolve interactive prompt issues

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('customerportal', '0017_customertransactionsalesorderbasicdetails_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customertransactionsalesordersalesperson',
            name='salesperson_in_charge',
            field=models.CharField(blank=True, help_text='Salesperson In Charge', max_length=255, null=True),
        ),
    ]
