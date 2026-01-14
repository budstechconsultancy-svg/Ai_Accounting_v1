from rest_framework import serializers
from .models import POSeries

class POSeriesSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_path = serializers.CharField(source='category.full_path', read_only=True)
    
    class Meta:
        model = POSeries
        fields = '__all__'
