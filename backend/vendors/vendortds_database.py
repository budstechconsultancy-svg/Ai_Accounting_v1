"""
Database operations for Vendor Master TDS & Other Statutory Details.
"""

from django.db import connection
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


def create_vendor_tds(data: Dict) -> Dict:
    """
    Create a new vendor TDS record in the database.
    
    Args:
        data: Dictionary containing TDS details
        
    Returns:
        Dictionary with created TDS record details
    """
    query = """
        INSERT INTO vendor_master_tds (
            tenant_id, vendor_basic_detail_id, pan_number, tan_number,
            tds_section, tds_rate, tds_section_applicable, enable_automatic_tds_posting,
            msme_udyam_no, fssai_license_no, import_export_code, eou_status,
            cin_number, is_active, created_at, updated_at, created_by, updated_by
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s
        )
    """
    
    params = [
        data.get('tenant_id'),
        data.get('vendor_basic_detail_id'),
        data.get('pan_number'),
        data.get('tan_number'),
        data.get('tds_section'),
        data.get('tds_rate'),
        data.get('tds_section_applicable'),
        data.get('enable_automatic_tds_posting', False),
        data.get('msme_udyam_no'),
        data.get('fssai_license_no'),
        data.get('import_export_code'),
        data.get('eou_status'),
        data.get('cin_number'),
        data.get('is_active', True),
        data.get('created_by'),
        data.get('updated_by'),
    ]
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            tds_id = cursor.lastrowid
            
        logger.info(f"Created vendor TDS record with ID: {tds_id}")
        return get_vendor_tds_by_id(tds_id)
    except Exception as e:
        logger.error(f"Error creating vendor TDS: {str(e)}")
        raise


def update_vendor_tds(tds_id: int, data: Dict) -> Dict:
    """
    Update an existing vendor TDS record.
    
    Args:
        tds_id: ID of the TDS record to update
        data: Dictionary containing updated TDS details
        
    Returns:
        Dictionary with updated TDS record details
    """
    query = """
        UPDATE vendor_master_tds
        SET pan_number = %s, tan_number = %s, tds_section = %s, tds_rate = %s,
            tds_section_applicable = %s, enable_automatic_tds_posting = %s,
            msme_udyam_no = %s, fssai_license_no = %s, import_export_code = %s,
            eou_status = %s, cin_number = %s, is_active = %s,
            updated_at = NOW(), updated_by = %s
        WHERE id = %s
    """
    
    params = [
        data.get('pan_number'),
        data.get('tan_number'),
        data.get('tds_section'),
        data.get('tds_rate'),
        data.get('tds_section_applicable'),
        data.get('enable_automatic_tds_posting', False),
        data.get('msme_udyam_no'),
        data.get('fssai_license_no'),
        data.get('import_export_code'),
        data.get('eou_status'),
        data.get('cin_number'),
        data.get('is_active', True),
        data.get('updated_by'),
        tds_id,
    ]
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            
        logger.info(f"Updated vendor TDS record with ID: {tds_id}")
        return get_vendor_tds_by_id(tds_id)
    except Exception as e:
        logger.error(f"Error updating vendor TDS: {str(e)}")
        raise


def get_vendor_tds_by_id(tds_id: int) -> Optional[Dict]:
    """
    Get vendor TDS record by ID.
    
    Args:
        tds_id: ID of the TDS record
        
    Returns:
        Dictionary with TDS record details or None
    """
    query = """
        SELECT id, tenant_id, vendor_basic_detail_id, pan_number, tan_number,
               tds_section, tds_rate, tds_section_applicable, enable_automatic_tds_posting,
               msme_udyam_no, fssai_license_no, import_export_code, eou_status,
               cin_number, is_active, created_at, updated_at, created_by, updated_by
        FROM vendor_master_tds
        WHERE id = %s
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, [tds_id])
            row = cursor.fetchone()
            
            if row:
                return {
                    'id': row[0],
                    'tenant_id': row[1],
                    'vendor_basic_detail_id': row[2],
                    'pan_number': row[3],
                    'tan_number': row[4],
                    'tds_section': row[5],
                    'tds_rate': float(row[6]) if row[6] else None,
                    'tds_section_applicable': row[7],
                    'enable_automatic_tds_posting': bool(row[8]),
                    'msme_udyam_no': row[9],
                    'fssai_license_no': row[10],
                    'import_export_code': row[11],
                    'eou_status': row[12],
                    'cin_number': row[13],
                    'is_active': bool(row[14]),
                    'created_at': row[15],
                    'updated_at': row[16],
                    'created_by': row[17],
                    'updated_by': row[18],
                }
            return None
    except Exception as e:
        logger.error(f"Error getting vendor TDS by ID: {str(e)}")
        raise


def get_vendor_tds_by_vendor(vendor_basic_detail_id: int) -> Optional[Dict]:
    """
    Get vendor TDS record by vendor basic detail ID.
    
    Args:
        vendor_basic_detail_id: ID of the vendor basic detail
        
    Returns:
        Dictionary with TDS record details or None
    """
    query = """
        SELECT id, tenant_id, vendor_basic_detail_id, pan_number, tan_number,
               tds_section, tds_rate, tds_section_applicable, enable_automatic_tds_posting,
               msme_udyam_no, fssai_license_no, import_export_code, eou_status,
               cin_number, is_active, created_at, updated_at, created_by, updated_by
        FROM vendor_master_tds
        WHERE vendor_basic_detail_id = %s AND is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, [vendor_basic_detail_id])
            row = cursor.fetchone()
            
            if row:
                return {
                    'id': row[0],
                    'tenant_id': row[1],
                    'vendor_basic_detail_id': row[2],
                    'pan_number': row[3],
                    'tan_number': row[4],
                    'tds_section': row[5],
                    'tds_rate': float(row[6]) if row[6] else None,
                    'tds_section_applicable': row[7],
                    'enable_automatic_tds_posting': bool(row[8]),
                    'msme_udyam_no': row[9],
                    'fssai_license_no': row[10],
                    'import_export_code': row[11],
                    'eou_status': row[12],
                    'cin_number': row[13],
                    'is_active': bool(row[14]),
                    'created_at': row[15],
                    'updated_at': row[16],
                    'created_by': row[17],
                    'updated_by': row[18],
                }
            return None
    except Exception as e:
        logger.error(f"Error getting vendor TDS by vendor: {str(e)}")
        raise


def list_vendor_tds_by_tenant(tenant_id: str) -> List[Dict]:
    """
    List all vendor TDS records for a tenant.
    
    Args:
        tenant_id: Tenant ID
        
    Returns:
        List of dictionaries with TDS record details
    """
    query = """
        SELECT id, tenant_id, vendor_basic_detail_id, pan_number, tan_number,
               tds_section, tds_rate, tds_section_applicable, enable_automatic_tds_posting,
               msme_udyam_no, fssai_license_no, import_export_code, eou_status,
               cin_number, is_active, created_at, updated_at, created_by, updated_by
        FROM vendor_master_tds
        WHERE tenant_id = %s
        ORDER BY created_at DESC
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, [tenant_id])
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append({
                    'id': row[0],
                    'tenant_id': row[1],
                    'vendor_basic_detail_id': row[2],
                    'pan_number': row[3],
                    'tan_number': row[4],
                    'tds_section': row[5],
                    'tds_rate': float(row[6]) if row[6] else None,
                    'tds_section_applicable': row[7],
                    'enable_automatic_tds_posting': bool(row[8]),
                    'msme_udyam_no': row[9],
                    'fssai_license_no': row[10],
                    'import_export_code': row[11],
                    'eou_status': row[12],
                    'cin_number': row[13],
                    'is_active': bool(row[14]),
                    'created_at': row[15],
                    'updated_at': row[16],
                    'created_by': row[17],
                    'updated_by': row[18],
                })
            
            return results
    except Exception as e:
        logger.error(f"Error listing vendor TDS by tenant: {str(e)}")
        raise


def delete_vendor_tds(tds_id: int) -> bool:
    """
    Soft delete a vendor TDS record.
    
    Args:
        tds_id: ID of the TDS record to delete
        
    Returns:
        True if successful
    """
    query = """
        UPDATE vendor_master_tds
        SET is_active = 0, updated_at = NOW()
        WHERE id = %s
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, [tds_id])
            
        logger.info(f"Deleted vendor TDS record with ID: {tds_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting vendor TDS: {str(e)}")
        raise
