"""
Test cases for automatic ledger code generation.

This module tests the code generation logic for ledgers based on their
hierarchy position in the Chart of Accounts.

Author: Development Team
Last Updated: 2025-12-29
"""

import pytest
from django.test import TestCase
from accounting.models import MasterLedger, MasterHierarchyRaw
from accounting.utils import generate_ledger_code
from core.models import Tenant


@pytest.mark.django_db
class TestLedgerCodeGeneration(TestCase):
    """Test cases for automatic ledger code generation"""
    
    def setUp(self):
        """Set up test data"""
        # Create test tenant
        self.tenant = Tenant.objects.create(
            name="Test Company",
            domain="test.example.com"
        )
        
        # Create test hierarchy data
        MasterHierarchyRaw.objects.create(
            major_group_1="Assets",
            group_1="Current Assets",
            sub_group_1_1="Cash & Bank",
            ledger_1="Cash in Hand",
            code="010101010101"
        )
        
        MasterHierarchyRaw.objects.create(
            major_group_1="Liabilities",
            group_1="Current Liabilities",
            sub_group_1_1="Sundry Creditors",
            ledger_1="Trade Creditors",
            code="020202020202"
        )
    
    def test_hierarchy_based_code_generation_group_level(self):
        """Test code generation based on group hierarchy"""
        ledger_data = {
            'name': 'Petty Cash',
            'category': 'Assets',
            'group': 'Current Assets'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "01010101.001" (8-digit group code + suffix)
        self.assertIsNotNone(code)
        self.assertTrue(code.startswith("01010101"))
        self.assertIn(".", code)
        self.assertEqual(code, "01010101.001")
    
    def test_hierarchy_based_code_generation_sub_group_level(self):
        """Test code generation based on sub-group hierarchy"""
        ledger_data = {
            'name': 'Bank Account',
            'category': 'Assets',
            'group': 'Current Assets',
            'sub_group_1': 'Cash & Bank'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "0101010101.001" (10-digit sub-group code + suffix)
        self.assertIsNotNone(code)
        self.assertTrue(code.startswith("0101010101"))
        self.assertIn(".", code)
    
    def test_nested_ledger_code_generation(self):
        """Test code generation for nested custom ledgers"""
        # Create parent ledger
        parent = MasterLedger.objects.create(
            name="Main Account",
            code="9001",
            tenant_id=self.tenant.id
        )
        
        ledger_data = {
            'name': 'Sub Account',
            'parent_ledger_id': parent.id
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "9001.001"
        self.assertEqual(code, "9001.001")
    
    def test_deeply_nested_ledger_code_generation(self):
        """Test code generation for deeply nested ledgers"""
        # Create parent hierarchy
        parent = MasterLedger.objects.create(
            name="Main Account",
            code="9001",
            tenant_id=self.tenant.id
        )
        
        child = MasterLedger.objects.create(
            name="Sub Account",
            code="9001.001",
            parent_ledger_id=parent.id,
            tenant_id=self.tenant.id
        )
        
        # Create grandchild
        ledger_data = {
            'name': 'Sub-Sub Account',
            'parent_ledger_id': child.id
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code like "9001.001.001"
        self.assertEqual(code, "9001.001.001")
    
    def test_fallback_code_generation(self):
        """Test fallback code generation for unclassified ledgers"""
        ledger_data = {
            'name': 'Custom Ledger'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate code in 9000+ range
        self.assertTrue(code.startswith("9"))
        self.assertTrue(int(code) >= 9000)
        self.assertEqual(code, "9001")
    
    def test_sequential_code_generation_same_group(self):
        """Test that sequential ledgers in same group get incremental codes"""
        ledger_data = {
            'name': 'Ledger 1',
            'category': 'Assets',
            'group': 'Current Assets'
        }
        
        # Create first ledger
        code1 = generate_ledger_code(ledger_data, self.tenant.id)
        MasterLedger.objects.create(
            name='Ledger 1',
            code=code1,
            category='Assets',
            group='Current Assets',
            tenant_id=self.tenant.id
        )
        
        # Create second ledger
        ledger_data['name'] = 'Ledger 2'
        code2 = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Codes should be sequential
        self.assertNotEqual(code1, code2)
        self.assertEqual(code1, "01010101.001")
        self.assertEqual(code2, "01010101.002")
    
    def test_sequential_nested_code_generation(self):
        """Test sequential code generation for nested ledgers"""
        parent = MasterLedger.objects.create(
            name="Main Account",
            code="9001",
            tenant_id=self.tenant.id
        )
        
        # Create first child
        ledger_data1 = {
            'name': 'Child 1',
            'parent_ledger_id': parent.id
        }
        code1 = generate_ledger_code(ledger_data1, self.tenant.id)
        MasterLedger.objects.create(
            name='Child 1',
            code=code1,
            parent_ledger_id=parent.id,
            tenant_id=self.tenant.id
        )
        
        # Create second child
        ledger_data2 = {
            'name': 'Child 2',
            'parent_ledger_id': parent.id
        }
        code2 = generate_ledger_code(ledger_data2, self.tenant.id)
        
        # Codes should be sequential
        self.assertEqual(code1, "9001.001")
        self.assertEqual(code2, "9001.002")
    
    def test_code_uniqueness_across_tenants(self):
        """Test that codes can be reused across different tenants"""
        tenant2 = Tenant.objects.create(
            name="Test Company 2",
            domain="test2.example.com"
        )
        
        ledger_data = {
            'name': 'Cash',
            'category': 'Assets',
            'group': 'Current Assets'
        }
        
        code1 = generate_ledger_code(ledger_data, self.tenant.id)
        code2 = generate_ledger_code(ledger_data, tenant2.id)
        
        # Codes should be the same for different tenants
        # (uniqueness is scoped by tenant_id)
        self.assertEqual(code1, code2)
        self.assertEqual(code1, "01010101.001")
    
    def test_parent_without_code_fallback(self):
        """Test fallback when parent ledger has no code"""
        # Create parent without code
        parent = MasterLedger.objects.create(
            name="Parent Without Code",
            tenant_id=self.tenant.id
        )
        
        ledger_data = {
            'name': 'Child Ledger',
            'parent_ledger_id': parent.id
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9000+ range
        self.assertEqual(code, "9001")
    
    def test_nonexistent_parent_fallback(self):
        """Test fallback when parent ledger doesn't exist"""
        ledger_data = {
            'name': 'Orphan Ledger',
            'parent_ledger_id': 99999  # Non-existent ID
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9000+ range
        self.assertEqual(code, "9001")
    
    def test_hierarchy_not_in_master_fallback(self):
        """Test fallback when hierarchy doesn't exist in master_hierarchy_raw"""
        ledger_data = {
            'name': 'Unknown Hierarchy Ledger',
            'category': 'NonExistent Category',
            'group': 'NonExistent Group'
        }
        
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9000+ range
        self.assertEqual(code, "9001")
    
    def test_fallback_sequential_codes(self):
        """Test sequential fallback code generation"""
        # Create first fallback ledger
        ledger_data1 = {'name': 'Fallback 1'}
        code1 = generate_ledger_code(ledger_data1, self.tenant.id)
        MasterLedger.objects.create(
            name='Fallback 1',
            code=code1,
            tenant_id=self.tenant.id
        )
        
        # Create second fallback ledger
        ledger_data2 = {'name': 'Fallback 2'}
        code2 = generate_ledger_code(ledger_data2, self.tenant.id)
        
        # Codes should be sequential
        self.assertEqual(code1, "9001")
        self.assertEqual(code2, "9002")
    
    def test_code_format_validation(self):
        """Test that generated codes follow the expected format"""
        test_cases = [
            # (ledger_data, expected_pattern)
            (
                {'category': 'Assets', 'group': 'Current Assets'},
                r'^\d{8}\.\d{3}$'  # 8 digits + dot + 3 digits
            ),
            (
                {'name': 'Fallback'},
                r'^9\d{3}$'  # 9xxx format
            ),
        ]
        
        import re
        for ledger_data, pattern in test_cases:
            code = generate_ledger_code(ledger_data, self.tenant.id)
            self.assertIsNotNone(re.match(pattern, code),
                f"Code '{code}' doesn't match pattern '{pattern}'")
    
    def test_multiple_hierarchy_levels(self):
        """Test code generation prioritizes most specific hierarchy level"""
        # Create hierarchy with multiple levels
        MasterHierarchyRaw.objects.create(
            major_group_1="Income",
            group_1="Direct Income",
            sub_group_1_1="Sales",
            sub_group_2_1="Domestic Sales",
            code="030303030303"
        )
        
        # Test with only group
        ledger_data1 = {
            'category': 'Income',
            'group': 'Direct Income'
        }
        code1 = generate_ledger_code(ledger_data1, self.tenant.id)
        self.assertTrue(code1.startswith("03030303"))  # 8-digit group code
        
        # Test with sub_group_1
        ledger_data2 = {
            'category': 'Income',
            'group': 'Direct Income',
            'sub_group_1': 'Sales'
        }
        code2 = generate_ledger_code(ledger_data2, self.tenant.id)
        self.assertTrue(code2.startswith("0303030303"))  # 10-digit sub-group code
        
        # Test with sub_group_2 (most specific)
        ledger_data3 = {
            'category': 'Income',
            'group': 'Direct Income',
            'sub_group_1': 'Sales',
            'sub_group_2': 'Domestic Sales'
        }
        code3 = generate_ledger_code(ledger_data3, self.tenant.id)
        self.assertTrue(code3.startswith("030303030303"))  # 12-digit sub-group code


@pytest.mark.django_db
class TestLedgerCodeEdgeCases(TestCase):
    """Test edge cases and error conditions"""
    
    def setUp(self):
        """Set up test data"""
        self.tenant = Tenant.objects.create(
            name="Test Company",
            domain="test.example.com"
        )
    
    def test_empty_ledger_data(self):
        """Test code generation with empty ledger data"""
        ledger_data = {}
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9001
        self.assertEqual(code, "9001")
    
    def test_none_values_in_hierarchy(self):
        """Test code generation with None values in hierarchy fields"""
        ledger_data = {
            'name': 'Test Ledger',
            'category': None,
            'group': None,
            'sub_group_1': None
        }
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9001
        self.assertEqual(code, "9001")
    
    def test_empty_string_hierarchy(self):
        """Test code generation with empty string hierarchy fields"""
        ledger_data = {
            'name': 'Test Ledger',
            'category': '',
            'group': '',
        }
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should fall back to 9001
        self.assertEqual(code, "9001")
    
    def test_max_suffix_boundary(self):
        """Test code generation when approaching max suffix (999)"""
        parent = MasterLedger.objects.create(
            name="Parent",
            code="9001",
            tenant_id=self.tenant.id
        )
        
        # Create ledger with high suffix
        MasterLedger.objects.create(
            name="Child 998",
            code="9001.998",
            parent_ledger_id=parent.id,
            tenant_id=self.tenant.id
        )
        
        ledger_data = {
            'name': 'Child 999',
            'parent_ledger_id': parent.id
        }
        code = generate_ledger_code(ledger_data, self.tenant.id)
        
        # Should generate 9001.999
        self.assertEqual(code, "9001.999")


# Run tests with: python manage.py test accounting.tests.test_ledger_code_generation
