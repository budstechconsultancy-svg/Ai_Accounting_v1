from rest_framework import serializers
from .models import POSeries

class POSeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSeries
        fields = '__all__'
