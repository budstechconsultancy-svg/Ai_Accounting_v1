from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import POSeries
from .serializers import POSeriesSerializer

class POSeriesViewSet(viewsets.ModelViewSet):
    queryset = POSeries.objects.all()
    serializer_class = POSeriesSerializer
    permission_classes = [AllowAny]  # TODO: Add proper authentication
