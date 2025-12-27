from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0004_master_remove_accountgroup_parent_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            """
            DROP TABLE IF EXISTS journal_entries;
            CREATE TABLE journal_entries (
                id bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                tenant_id varchar(36) NOT NULL,
                ledger varchar(255) NOT NULL,
                debit decimal(15, 2) NOT NULL,
                credit decimal(15, 2) NOT NULL,
                voucher_id varchar(50) NOT NULL,
                CONSTRAINT fk_journal_entries_vouchers_final FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE
            );
            CREATE INDEX idx_journal_entries_tenant_final ON journal_entries(tenant_id);
            """,
            reverse_sql="DROP TABLE IF EXISTS journal_entries;"
        )
    ]
