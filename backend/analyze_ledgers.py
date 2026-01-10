
import os
import django
import pandas as pd

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from accounting.models import MasterLedger

def analyze_ledgers():
    print("ANALYSIS: MasterLedger Data Distribution for Asset Ledgers")
    
    # Filter for Asset ledgers possibly related to Cash/Bank
    ledgers = MasterLedger.objects.filter(
        category='Asset'
    ).values(
        'id', 'name', 'group', 'sub_group_1', 'sub_group_2', 
        'ledger_type', 'code'
    )
    
    df = pd.DataFrame(list(ledgers))
    if df.empty:
        print("No Asset ledgers found.")
        return

    print(f"\nTotal Asset Ledgers: {len(df)}")
    
    # Add a column for 'Has Cash/Bank Keyword'
    keywords = ['cash', 'bank', 'cash-in-hand', 'bank accounts']
    
    def has_keyword(row):
        txt = f"{row['group']} {row['sub_group_1']} {row['sub_group_2']}".lower()
        return any(k in txt for k in keywords)

    df['matches_keyword'] = df.apply(has_keyword, axis=1)
    
    matched = df[df['matches_keyword']]
    print(f"\nLedgers matching Cash/Bank keywords: {len(matched)}")
    
    print("\nSample of Matches:")
    print(matched[['name', 'sub_group_1', 'sub_group_2', 'ledger_type']].head(20).to_string())
    
    # Check correlation between ledger_type and 'looks like a group'
    print("\nAnalysis of Empty Ledger Type:")
    empty_type = matched[matched['ledger_type'].isna() | (matched['ledger_type'] == '')]
    print(f"Count of Empty Ledger Type: {len(empty_type)}")
    if not empty_type.empty:
        print(empty_type[['name', 'sub_group_1', 'sub_group_2']].head(10).to_string())

if __name__ == "__main__":
    analyze_ledgers()
