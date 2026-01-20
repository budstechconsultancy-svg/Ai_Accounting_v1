# Generated manually for customer separate tables
import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customerportal', '0012_customermastercustomerproductservice_customer_uom_and_more'),
    ]

    operations = [
        # Create new BasicDetails table
        migrations.CreateModel(
            name='CustomerMasterCustomerBasicDetails',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('customer_name', models.CharField(max_length=255)),
                ('customer_code', models.CharField(max_length=50)),
                ('pan_number', models.CharField(blank=True, max_length=10, null=True)),
                ('contact_person', models.CharField(blank=True, max_length=255, null=True)),
                ('email_address', models.EmailField(blank=True, max_length=254, null=True, validators=[django.core.validators.EmailValidator()])),
                ('contact_number', models.CharField(blank=True, max_length=15, null=True)),
                ('is_also_vendor', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('is_deleted', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(blank=True, max_length=100, null=True)),
                ('updated_by', models.CharField(blank=True, max_length=100, null=True)),
                ('customer_category', models.ForeignKey(blank=True, db_column='customer_category_id', db_constraint=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='customers_new', to='customerportal.customermastercategory')),
            ],
            options={
                'db_table': 'customer_master_customer_basicdetails',
            },
        ),
        
        # Create GST Details table
        migrations.CreateModel(
            name='CustomerMasterCustomerGSTDetails',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('gstin', models.CharField(blank=True, help_text='GST Identification Number', max_length=15, null=True)),
                ('is_unregistered', models.BooleanField(default=False, help_text='Is customer unregistered for GST')),
                ('branch_reference_name', models.CharField(blank=True, max_length=255, null=True)),
                ('branch_address', models.TextField(blank=True, null=True)),
                ('branch_contact_person', models.CharField(blank=True, max_length=255, null=True)),
                ('branch_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('branch_contact_number', models.CharField(blank=True, max_length=15, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(blank=True, max_length=100, null=True)),
                ('updated_by', models.CharField(blank=True, max_length=100, null=True)),
                ('customer_basic_detail', models.ForeignKey(db_column='customer_basic_detail_id', on_delete=django.db.models.deletion.CASCADE, related_name='gst_details', to='customerportal.customermastercustomerbasicdetails')),
            ],
            options={
                'db_table': 'customer_master_customer_gstdetails',
            },
        ),
        
        # Create TDS table
        migrations.CreateModel(
            name='CustomerMasterCustomerTDS',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('msme_no', models.CharField(blank=True, help_text='MSME Registration Number', max_length=50, null=True)),
                ('fssai_no', models.CharField(blank=True, help_text='FSSAI License Number', max_length=50, null=True)),
                ('iec_code', models.CharField(blank=True, help_text='Import Export Code', max_length=50, null=True)),
                ('eou_status', models.CharField(blank=True, help_text='Export Oriented Unit Status', max_length=100, null=True)),
                ('tcs_section', models.CharField(blank=True, help_text='TCS Section', max_length=50, null=True)),
                ('tcs_enabled', models.BooleanField(default=False, help_text='Is TCS Enabled')),
                ('tds_section', models.CharField(blank=True, help_text='TDS Section', max_length=50, null=True)),
                ('tds_enabled', models.BooleanField(default=False, help_text='Is TDS Enabled')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(blank=True, max_length=100, null=True)),
                ('updated_by', models.CharField(blank=True, max_length=100, null=True)),
                ('customer_basic_detail', models.OneToOneField(db_column='customer_basic_detail_id', on_delete=django.db.models.deletion.CASCADE, related_name='tds_details', to='customerportal.customermastercustomerbasicdetails')),
            ],
            options={
                'db_table': 'customer_master_customer_tds',
            },
        ),
        
        # Create Banking table
        migrations.CreateModel(
            name='CustomerMasterCustomerBanking',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tenant_id', models.CharField(db_index=True, max_length=36)),
                ('account_number', models.CharField(help_text='Bank Account Number', max_length=50)),
                ('bank_name', models.CharField(help_text='Bank Name', max_length=255)),
                ('ifsc_code', models.CharField(help_text='IFSC Code', max_length=11)),
                ('branch_name', models.CharField(blank=True, help_text='Branch Name', max_length=255, null=True)),
                ('swift_code', models.CharField(blank=True, help_text='SWIFT Code for international transfers', max_length=11, null=True)),
                ('associated_branches', models.JSONField(blank=True, help_text='List of associated branch references', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.CharField(blank=True, max_length=100, null=True)),
                ('updated_by', models.CharField(blank=True, max_length=100, null=True)),
                ('customer_basic_detail', models.ForeignKey(db_column='customer_basic_detail_id', on_delete=django.db.models.deletion.CASCADE, related_name='banking_details', to='customerportal.customermastercustomerbasicdetails')),
            ],
            options={
                'db_table': 'customer_master_customer_banking',
            },
        ),
        
        # Add indexes for BasicDetails
        migrations.AddIndex(
            model_name='customermastercustomerbasicdetails',
            index=models.Index(fields=['tenant_id', 'customer_code'], name='customer_ma_tenant__b022d9_idx'),
        ),
        migrations.AddIndex(
            model_name='customermastercustomerbasicdetails',
            index=models.Index(fields=['tenant_id', 'is_deleted'], name='customer_ma_tenant__3e3878_idx'),
        ),
        migrations.AddIndex(
            model_name='customermastercustomerbasicdetails',
            index=models.Index(fields=['customer_category'], name='customer_ma_custome_76c4f7_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='customermastercustomerbasicdetails',
            unique_together={('tenant_id', 'customer_code')},
        ),
        
        # Add indexes for Banking
        migrations.AddIndex(
            model_name='customermastercustomerbanking',
            index=models.Index(fields=['tenant_id', 'account_number'], name='customer_ma_tenant__5a8c4b_idx'),
        ),
        migrations.AddIndex(
            model_name='customermastercustomerbanking',
            index=models.Index(fields=['customer_basic_detail'], name='customer_ma_custome_51667c_idx'),
        ),
        
        # Add indexes for GST Details
        migrations.AddIndex(
            model_name='customermastercustomergstdetails',
            index=models.Index(fields=['tenant_id', 'gstin'], name='customer_ma_tenant__67bb65_idx'),
        ),
        migrations.AddIndex(
            model_name='customermastercustomergstdetails',
            index=models.Index(fields=['customer_basic_detail'], name='customer_ma_custome_872a83_idx'),
        ),
        
        # Add indexes for TDS
        migrations.AddIndex(
            model_name='customermastercustomertds',
            index=models.Index(fields=['tenant_id'], name='customer_ma_tenant__a8fdc7_idx'),
        ),
        migrations.AddIndex(
            model_name='customermastercustomertds',
            index=models.Index(fields=['customer_basic_detail'], name='customer_ma_custome_1ee6ec_idx'),
        ),
    ]
