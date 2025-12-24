# Generated manually for voucher masters

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0002_alter_accountgroup_tenant_id_alter_ledger_tenant_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='VoucherType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'db_table': 'voucher_types',
            },
        ),
        migrations.CreateModel(
            name='VoucherNumbering',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('voucher_kind', models.CharField(max_length=20, choices=[('sales', 'Sales Invoices'), ('purchase', 'Purchase Vouchers')])),
                ('prefix', models.CharField(blank=True, max_length=10, null=True)),
                ('suffix', models.CharField(blank=True, max_length=20, null=True)),
                ('next_number', models.IntegerField(default=1)),
                ('padding', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'voucher_numbering',
            },
        ),
        migrations.AddConstraint(
            model_name='vouchertype',
            constraint=models.UniqueConstraint(fields=('name', 'tenant_id'), name='unique_voucher_type_name_tenant'),
        ),
        migrations.AddConstraint(
            model_name='vouchernumbering',
            constraint=models.UniqueConstraint(fields=('voucher_kind', 'tenant_id'), name='unique_voucher_numbering_kind_tenant'),
        ),
    ]
