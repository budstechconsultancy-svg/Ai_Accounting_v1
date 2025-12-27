"""
Permission Constants - Hardcoded 33 Permissions
All permissions are defined here with sequential IDs (1-33).
DO NOT store these in the database.
"""

# All 33 permissions hardcoded - single source of truth
PERMISSIONS = {
    # Module 1: DASHBOARD (1 permission)
    1: {'code': 'DASHBOARD_VIEW', 'name': 'View Dashboard', 'module': 'DASHBOARD'},
    
    # Module 2: MASTERS (3 permissions)
    2: {'code': 'MASTERS_LEDGERS', 'name': 'Ledgers', 'module': 'MASTERS'},
    3: {'code': 'MASTERS_LEDGER_GROUPS', 'name': 'Ledger Groups', 'module': 'MASTERS'},
    4: {'code': 'MASTERS_VOUCHER_CONFIG', 'name': 'Voucher Configuration', 'module': 'MASTERS'},
    
    # Module 3: INVENTORY (3 permissions)
    5: {'code': 'INVENTORY_ITEMS', 'name': 'Stock Items', 'module': 'INVENTORY'},
    6: {'code': 'INVENTORY_STOCK_GROUPS', 'name': 'Stock Groups', 'module': 'INVENTORY'},
    7: {'code': 'INVENTORY_UNITS', 'name': 'Units', 'module': 'INVENTORY'},
    
    # Module 4: VOUCHERS (6 permissions)
    8: {'code': 'VOUCHERS_SALES', 'name': 'Sales', 'module': 'VOUCHERS'},
    9: {'code': 'VOUCHERS_PURCHASE', 'name': 'Purchase', 'module': 'VOUCHERS'},
    10: {'code': 'VOUCHERS_PAYMENT', 'name': 'Payment', 'module': 'VOUCHERS'},
    11: {'code': 'VOUCHERS_RECEIPT', 'name': 'Receipt', 'module': 'VOUCHERS'},
    12: {'code': 'VOUCHERS_CONTRA', 'name': 'Contra', 'module': 'VOUCHERS'},
    13: {'code': 'VOUCHERS_JOURNAL', 'name': 'Journal', 'module': 'VOUCHERS'},
    
    # Module 5: REPORTS (5 permissions)
    14: {'code': 'REPORTS_DAY_BOOK', 'name': 'Day Book', 'module': 'REPORTS'},
    15: {'code': 'REPORTS_LEDGER', 'name': 'Ledger Report', 'module': 'REPORTS'},
    16: {'code': 'REPORTS_TRIAL_BALANCE', 'name': 'Trial Balance', 'module': 'REPORTS'},
    17: {'code': 'REPORTS_STOCK_SUMMARY', 'name': 'Stock Summary', 'module': 'REPORTS'},
    18: {'code': 'REPORTS_GST', 'name': 'GST Reports', 'module': 'REPORTS'},
    
    # Module 6: SETTINGS (1 permission)
    19: {'code': 'SETTINGS_COMPANY', 'name': 'Company Settings', 'module': 'SETTINGS'},
    
    # Module 7: USERS (2 permissions)
    20: {'code': 'USERS_MANAGE', 'name': 'Manage Users', 'module': 'USERS'},
    21: {'code': 'USERS_ROLES', 'name': 'Manage Roles', 'module': 'USERS'},
    
    # Module 8: AI (2 permissions)
    22: {'code': 'AI_ASSISTANT', 'name': 'AI Assistant', 'module': 'AI'},
    23: {'code': 'AI_INVOICE', 'name': 'Invoice Extraction', 'module': 'AI'},
    
    # Module 9: ACCOUNTING (11 permissions)
    24: {'code': 'ACCOUNTING_LEDGERS', 'name': 'Ledger Management', 'module': 'ACCOUNTING'},
    25: {'code': 'ACCOUNTING_GROUPS', 'name': 'Group Management', 'module': 'ACCOUNTING'},
    26: {'code': 'ACCOUNTING_VOUCHERS', 'name': 'Voucher Entry', 'module': 'ACCOUNTING'},
    27: {'code': 'ACCOUNTING_DAYBOOK', 'name': 'Day Book', 'module': 'ACCOUNTING'},
    28: {'code': 'ACCOUNTING_CASHBOOK', 'name': 'Cash Book', 'module': 'ACCOUNTING'},
    29: {'code': 'ACCOUNTING_BANKBOOK', 'name': 'Bank Book', 'module': 'ACCOUNTING'},
    30: {'code': 'ACCOUNTING_TRIAL', 'name': 'Trial Balance', 'module': 'ACCOUNTING'},
    31: {'code': 'ACCOUNTING_PL', 'name': 'Profit & Loss', 'module': 'ACCOUNTING'},
    32: {'code': 'ACCOUNTING_BALANCE', 'name': 'Balance Sheet', 'module': 'ACCOUNTING'},
    33: {'code': 'ACCOUNTING_GST', 'name': 'GST Reports', 'module': 'ACCOUNTING'},
}

# Module groupings for easier access
MODULES = {
    'DASHBOARD': [1],
    'MASTERS': [2, 3, 4],
    'INVENTORY': [5, 6, 7],
    'VOUCHERS': [8, 9, 10, 11, 12, 13],
    'REPORTS': [14, 15, 16, 17, 18],
    'SETTINGS': [19],
    'USERS': [20, 21],
    'AI': [22, 23],
    'ACCOUNTING': [24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
}


def get_permission_by_id(perm_id):
    """Get permission details by ID"""
    return PERMISSIONS.get(perm_id)


def get_permission_by_code(code):
    """Get permission details by code"""
    for perm_id, perm in PERMISSIONS.items():
        if perm['code'] == code:
            return {'id': perm_id, **perm}
    return None


def get_all_permission_ids():
    """Get all permission IDs (1-33)"""
    return list(PERMISSIONS.keys())


def get_permissions_by_module(module_name):
    """Get all permission IDs for a specific module"""
    return MODULES.get(module_name.upper(), [])


def get_permission_codes_from_ids(permission_ids):
    """Convert permission IDs to permission codes"""
    codes = set()
    for perm_id in permission_ids:
        perm = PERMISSIONS.get(perm_id)
        if perm:
            codes.add(perm['code'])
            codes.add(perm['module'])
    return list(codes)


def get_all_modules():
    """Get list of all module names"""
    return list(MODULES.keys())
