from django.contrib import admin
from .models import ClothingItem, WearLog, WeatherLog

@admin.register(ClothingItem)
class ClothingItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'color', 'weather_suitability', 'last_worn')
    list_filter = ('category', 'color', 'weather_suitability')
    search_fields = ('name', 'brand')

@admin.register(WearLog)
class WearLogAdmin(admin.ModelAdmin):
    list_display = ('date_worn', 'get_items_display', 'get_weather_display')
    list_filter = ('date_worn',)
    filter_horizontal = ('items',)

    def get_items_display(self, obj):
        return ", ".join([item.name for item in obj.items.all()])
    get_items_display.short_description = 'Items'

    def get_weather_display(self, obj):
        if obj.weather_log:
            return f"{obj.weather_log.conditions['primary']}, {obj.weather_log.temp_high}°F"
        return "No weather data"
    get_weather_display.short_description = 'Weather'

@admin.register(WeatherLog)
class WeatherLogAdmin(admin.ModelAdmin):
    list_display = ('date', 'temp_high', 'temp_low', 'precipitation_chance', 'humidity')
    list_filter = ('date',)
    search_fields = ('date',)
