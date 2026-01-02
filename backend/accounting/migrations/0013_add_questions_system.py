# Generated migration for questions system

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0012_backfill_ledger_codes'),
    ]

    operations = [
        # Add additional_data field to MasterLedger (skip if exists)
        # Note: This field may already exist if added manually
        # migrations.AddField(
        #     model_name='masterledger',
        #     name='additional_data',
        #     field=models.JSONField(blank=True, help_text='Stores answers to dynamic questions (e.g., opening balance, GSTIN, credit limit)', null=True),
        # ),
        
        # Create MasterQuestion model
        migrations.CreateModel(
            name='MasterQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_code', models.CharField(help_text='Unique code for the question (e.g., Q_OPENING_BALANCE, Q_GSTIN)', max_length=50, unique=True)),
                ('question_text', models.CharField(help_text='The actual question to display in UI', max_length=500)),
                ('question_type', models.CharField(help_text='text, number, decimal, date, dropdown, checkbox, radio, email, phone, gstin, pan, state', max_length=50)),
                ('is_required', models.BooleanField(default=False, help_text='Whether this question must be answered')),
                ('validation_rules', models.JSONField(blank=True, help_text='JSON object with validation rules: {min, max, pattern, options, etc}', null=True)),
                ('default_value', models.CharField(blank=True, help_text='Default value if any', max_length=255, null=True)),
                ('help_text', models.TextField(blank=True, help_text='Help text to show below the question', null=True)),
                ('display_order', models.IntegerField(default=0, help_text='Order in which questions should appear')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'master_questions',
                'ordering': ['display_order', 'question_code'],
            },
        ),
        
        # Create HierarchyQuestionMapping model
        migrations.CreateModel(
            name='HierarchyQuestionMapping',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(blank=True, help_text='Maps to major_group_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('group', models.CharField(blank=True, db_column='group', help_text='Maps to group_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('sub_group_1', models.CharField(blank=True, help_text='Maps to sub_group_1_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('sub_group_2', models.CharField(blank=True, help_text='Maps to sub_group_2_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('sub_group_3', models.CharField(blank=True, help_text='Maps to sub_group_3_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('ledger_type', models.CharField(blank=True, help_text='Maps to ledger_1 in master_hierarchy_raw', max_length=255, null=True)),
                ('condition_rules', models.JSONField(blank=True, help_text='Optional: Show this question only if certain conditions are met', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('question', models.ForeignKey(help_text='Foreign key to master_questions', on_delete=django.db.models.deletion.CASCADE, to='accounting.masterquestion')),
            ],
            options={
                'db_table': 'hierarchy_question_mapping',
            },
        ),
        
        # Add indexes
        migrations.AddIndex(
            model_name='masterquestion',
            index=models.Index(fields=['question_type'], name='master_ques_questio_idx'),
        ),
        migrations.AddIndex(
            model_name='masterquestion',
            index=models.Index(fields=['display_order'], name='master_ques_display_idx'),
        ),
        migrations.AddIndex(
            model_name='hierarchyquestionmapping',
            index=models.Index(fields=['question'], name='hierarchy_q_questio_idx'),
        ),
        migrations.AddIndex(
            model_name='hierarchyquestionmapping',
            index=models.Index(fields=['category'], name='hierarchy_q_categor_idx'),
        ),
        migrations.AddIndex(
            model_name='hierarchyquestionmapping',
            index=models.Index(fields=['group'], name='hierarchy_q_group_idx'),
        ),
        migrations.AddIndex(
            model_name='hierarchyquestionmapping',
            index=models.Index(fields=['ledger_type'], name='hierarchy_q_ledger__idx'),
        ),
        # Note: Composite index removed due to MySQL key length limit
        # Individual indexes above are sufficient for query performance
    ]

