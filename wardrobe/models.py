from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Weather(models.Model):
    date = models.DateField(unique=True)
    temp_high = models.FloatField(help_text="High temperature in Fahrenheit")
    temp_low = models.FloatField(help_text="Low temperature in Fahrenheit")
    precipitation_chance = models.IntegerField(help_text="Chance of precipitation in percentage")
    humidity = models.IntegerField(help_text="Humidity percentage")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.date}: {self.temp_low}°F - {self.temp_high}°F"

    def get_condition(self):
        """
        Derive weather condition from temperature, precipitation chance, and humidity.
        Returns a dictionary with detailed weather information.
        """
        avg_temp = (self.temp_high + self.temp_low) / 2
        
        conditions = []
        
        # Temperature-based conditions
        if avg_temp >= 85:
            conditions.append("hot")
        elif avg_temp >= 70:
            conditions.append("warm")
        elif avg_temp >= 50:
            conditions.append("mild")
        else:
            conditions.append("cold")

        # Precipitation-based conditions
        if self.precipitation_chance >= 60:
            conditions.append("rainy")
        elif self.precipitation_chance >= 30:
            conditions.append("chance of rain")

        # Humidity-based conditions
        if self.humidity >= 80:
            conditions.append("humid")
        elif self.humidity <= 30:
            conditions.append("dry")

        return {
            'primary': conditions[0],  # Main condition (temperature-based)
            'all': conditions,         # All applicable conditions
            'metrics': {
                'avg_temp': round(avg_temp, 1),
                'temp_range': f"{self.temp_low}°F - {self.temp_high}°F",
                'precipitation': f"{self.precipitation_chance}%",
                'humidity': f"{self.humidity}%"
            }
        }

class ClothingItem(models.Model):
    CATEGORY_CHOICES = [
        ('shirt', 'Shirt'),
        ('pants', 'Pants'),
        ('shoes', 'Shoes'),
        ('dress', 'Dress'),
        ('jacket', 'Jacket'),
        ('accessory', 'Accessory'),
    ]

    WEATHER_CHOICES = [
        ('hot', 'Hot'),
        ('warm', 'Warm'),
        ('cool', 'Cool'),
        ('cold', 'Cold'),
        ('rainy', 'Rainy'),
    ]

    COLOR_CHOICES = [
        ('red', 'Red'),
        ('blue', 'Blue'),
        ('yellow', 'Yellow'),
        ('white', 'White'),
        ('black', 'Black'),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='clothing_items/', blank=True, null=True)
    weather_suitability = models.CharField(max_length=20, choices=WEATHER_CHOICES)
    color = models.CharField(max_length=50, choices=COLOR_CHOICES)
    size = models.CharField(max_length=50, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    formality = models.CharField(max_length=50, blank=True)
    material = models.CharField(max_length=100, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_worn = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class WearLog(models.Model):
    items = models.ManyToManyField(ClothingItem)
    date_worn = models.DateTimeField()
    weather_log = models.ForeignKey('WeatherLog', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-date_worn']
        indexes = [
            models.Index(fields=['date_worn']),
        ]

    def __str__(self):
        return f"Outfit worn on {self.date_worn.date()}"

class WeatherLog(models.Model):
    date = models.DateTimeField()
    temp_high = models.FloatField()
    temp_low = models.FloatField()
    precipitation_chance = models.FloatField()
    humidity = models.FloatField()
    conditions = models.JSONField()  # Store the full conditions object
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Weather for {self.date.strftime('%Y-%m-%d')}"
