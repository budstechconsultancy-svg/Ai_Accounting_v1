from rest_framework import serializers
from .models_voucher_expense import VoucherExpense

class VoucherExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherExpense
        fields = '__all__'
        read_only_fields = ['tenant_id']
