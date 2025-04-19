from datetime import datetime, timedelta
from django.utils import timezone
from .models import Weather
import requests
from django.conf import settings

class WeatherService:
    CACHE_DURATION = timedelta(hours=1)  # Update weather data every hour

    @staticmethod
    def get_weather_for_date(date=None):
        """
        Get weather data for a specific date. If no date is provided, use today.
        Returns cached data if available and fresh, otherwise fetches new data.
        """
        if date is None:
            date = timezone.now().date()

        # Try to get cached weather data
        try:
            weather = Weather.objects.get(date=date)
            # Check if cache is still fresh
            if timezone.now() - weather.last_updated < WeatherService.CACHE_DURATION:
                return weather
        except Weather.DoesNotExist:
            weather = None

        # Fetch new weather data
        weather_data = WeatherService._fetch_weather_data()
        
        if weather:
            # Update existing record
            weather.temp_high = weather_data['temp_high']
            weather.temp_low = weather_data['temp_low']
            weather.precipitation_chance = weather_data['precipitation_chance']
            weather.humidity = weather_data['humidity']
            weather.save()
        else:
            # Create new record
            weather = Weather.objects.create(
                date=date,
                temp_high=weather_data['temp_high'],
                temp_low=weather_data['temp_low'],
                precipitation_chance=weather_data['precipitation_chance'],
                humidity=weather_data['humidity']
            )

        return weather

    @staticmethod
    def _fetch_weather_data():
        """
        Fetch weather data from external API.
        Replace this with your preferred weather API implementation.
        """
        # TODO: Replace with actual API call
        # For now, return mock data
        return {
            'temp_high': 75,  # Fahrenheit
            'temp_low': 65,   # Fahrenheit
            'precipitation_chance': 20,  # percentage
            'humidity': 65,    # percentage
        }

        # Example implementation with OpenWeatherMap:
        # api_key = settings.OPENWEATHER_API_KEY
        # city = settings.WEATHER_CITY  # e.g., "San Francisco,US"
        # url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=imperial"
        # 
        # response = requests.get(url)
        # data = response.json()
        # 
        # # Get today's forecast
        # today_forecast = data['list'][0]
        # 
        # return {
        #     'temp_high': today_forecast['main']['temp_max'],
        #     'temp_low': today_forecast['main']['temp_min'],
        #     'precipitation_chance': today_forecast.get('pop', 0) * 100,  # Convert to percentage
        #     'humidity': today_forecast['main']['humidity']
        # } 