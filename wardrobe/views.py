from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import ClothingItem, WearLog, WeatherLog, Weather
from .serializers import ClothingItemSerializer, WearLogSerializer, WeatherLogSerializer, WeatherSerializer
import requests
from django.conf import settings
from django.utils import timezone
from .services import WeatherService

# Create your views here.

class ClothingItemViewSet(viewsets.ModelViewSet):
    serializer_class = ClothingItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ClothingItem.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Get clothing suggestions based on current weather"""
        city = request.query_params.get('city')
        zip_code = request.query_params.get('zip_code')

        weather_service = WeatherService()
        try:
            weather_data = weather_service.get_weather(city=city, zip_code=zip_code)
            if not weather_data:
                return Response(
                    {"error": "Could not fetch weather data"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Get suitable items based on weather
            weather_suitability = weather_service.get_weather_suitability(weather_data['temperature'])
            suitable_items = self.get_queryset().filter(
                weather_suitability=weather_suitability
            ).order_by('last_worn')[:5]  # Get 5 least recently worn items

            return Response({
                'weather': weather_data,
                'suggestions': ClothingItemSerializer(suitable_items, many=True).data
            })
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class WearLogViewSet(viewsets.ModelViewSet):
    serializer_class = WearLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WearLog.objects.filter(items__owner=self.request.user).distinct()

    def create(self, request, *args, **kwargs):
        # Verify all items belong to the current user
        items_data = request.data.get('items', [])
        if isinstance(items_data, list):
            for item_data in items_data:
                try:
                    item_id = item_data.get('id')
                    if item_id:
                        item = ClothingItem.objects.get(id=item_id)
                        if item.owner != request.user:
                            return Response(
                                {"error": "Cannot create wear log with items that don't belong to you"},
                                status=status.HTTP_403_FORBIDDEN
                            )
                except ClothingItem.DoesNotExist:
                    return Response(
                        {"error": "One or more items not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )

        weather_data = request.data.get('weather_log')
        if weather_data:
            # Create a new WeatherLog
            weather_log = WeatherLog.objects.create(
                date=weather_data['date'],
                temp_high=weather_data['temp_high'],
                temp_low=weather_data['temp_low'],
                precipitation_chance=weather_data['precipitation_chance'],
                humidity=weather_data['humidity'],
                conditions=weather_data['conditions']
            )
            request.data['weather_log'] = weather_log.id
        else:
            request.data['weather_log'] = None

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # Create wear log entry
        wear_log = serializer.save()

        # Update last_worn for all items
        items_data = self.request.data.get('items', [])
        if isinstance(items_data, list):
            for item_data in items_data:
                try:
                    item_id = item_data.get('id')
                    if item_id:
                        item = ClothingItem.objects.get(id=item_id)
                        item.last_worn = timezone.now()
                        item.save()
                except ClothingItem.DoesNotExist:
                    continue

        return wear_log

    @action(detail=False, methods=['get'])
    def get_weather_suggestions(self, request):
        # This is a placeholder for weather API integration
        # You'll need to implement actual weather API calls here
        weather_condition = "sunny"  # This would come from a weather API
        temperature = 72  # This would come from a weather API
        
        suitable_items = ClothingItem.objects.filter(
            weather_suitability=self._get_weather_suitability(temperature)
        ).order_by('last_worn')[:5]
        
        serializer = ClothingItemSerializer(suitable_items, many=True)
        return Response({
            'weather': {
                'condition': weather_condition,
                'temperature': temperature
            },
            'suggestions': serializer.data
        })

    def _get_weather_suitability(self, temperature):
        if temperature > 80:
            return 'hot'
        elif temperature > 65:
            return 'warm'
        elif temperature > 50:
            return 'cool'
        else:
            return 'cold'

class WeatherViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Weather.objects.all()
    serializer_class = WeatherSerializer

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current weather data"""
        weather = WeatherService.get_weather_for_date()
        if not weather:
            return Response(
                {"error": "Could not fetch weather data"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        serializer = self.get_serializer(weather)
        return Response(serializer.data)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"}, status=status.HTTP_200_OK)
