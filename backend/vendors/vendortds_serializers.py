from rest_framework import serializers
from .models import VendorMasterTDS


class VendorMasterTDSSerializer(serializers.ModelSerializer):
    """
    Serializer for Vendor Master TDS & Other Statutory Details.
    """
    
    class Meta:
        model = VendorMasterTDS
        fields = [
            'id',
            'tenant_id',
            'vendor_basic_detail',
            'tds_section_applicable',
            'enable_automatic_tds_posting',
            'msme_udyam_no',
            'fssai_license_no',
            'import_export_code',
            'eou_status',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
