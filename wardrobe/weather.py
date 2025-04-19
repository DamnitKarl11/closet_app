import requests
from django.conf import settings
import os

class WeatherService:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.base_url = 'http://api.openweathermap.org/data/2.5/weather'

    def get_weather(self, city=None, zip_code=None, country_code='US'):
        """
        Get current weather data for a location
        :param city: City name (e.g., 'San Francisco')
        :param zip_code: ZIP code (e.g., '94105')
        :param country_code: Two-letter country code (default: 'US')
        :return: dict with weather data or None if error
        """
        if not self.api_key:
            raise ValueError("OpenWeather API key not found in environment variables")

        params = {
            'appid': self.api_key,
            'units': 'imperial'  # Use Fahrenheit
        }

        if zip_code:
            params['zip'] = f"{zip_code},{country_code}"
        elif city:
            params['q'] = f"{city},{country_code}"
        else:
            raise ValueError("Either city or zip_code must be provided")

        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()

            return {
                'temperature': data['main']['temp'],
                'condition': data['weather'][0]['main'].lower(),
                'description': data['weather'][0]['description'],
                'humidity': data['main']['humidity'],
                'wind_speed': data['wind']['speed']
            }
        except requests.RequestException as e:
            print(f"Error fetching weather data: {e}")
            return None

    def get_weather_suitability(self, temperature):
        """
        Determine weather suitability based on temperature
        :param temperature: Temperature in Fahrenheit
        :return: Weather suitability category
        """
        if temperature >= 80:
            return 'hot'
        elif temperature >= 65:
            return 'warm'
        elif temperature >= 50:
            return 'cool'
        else:
            return 'cold' 