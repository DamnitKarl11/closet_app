from rest_framework import serializers
from .models import ClothingItem, WearLog, WeatherLog, Weather

class WeatherSerializer(serializers.ModelSerializer):
    conditions = serializers.SerializerMethodField()

    class Meta:
        model = Weather
        fields = ['date', 'temp_high', 'temp_low', 'precipitation_chance', 'humidity', 'conditions', 'last_updated']

    def get_conditions(self, obj):
        return obj.get_condition()

class WeatherLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherLog
        fields = '__all__'

class ClothingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClothingItem
        fields = '__all__'

class WearLogSerializer(serializers.ModelSerializer):
    items = ClothingItemSerializer(many=True, read_only=True)
    weather_log = WeatherLogSerializer(read_only=True)
    item_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)

    class Meta:
        model = WearLog
        fields = ['id', 'items', 'item_ids', 'date_worn', 'weather_log', 'notes', 'created_at']

    def create(self, validated_data):
        item_ids = validated_data.pop('item_ids', [])
        wear_log = WearLog.objects.create(**validated_data)
        
        # Add items to the wear log
        wear_log.items.add(*item_ids)
        
        return wear_log 