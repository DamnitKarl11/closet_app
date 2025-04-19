from django.core.management.base import BaseCommand
from wardrobe.models import ClothingItem
from django.contrib.auth.models import User
import random

class Command(BaseCommand):
    help = 'Seeds the database with realistic men\'s wardrobe items for specified user(s)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Username to seed items for. If not provided, uses "admin"',
            default='admin'
        )

    def handle(self, *args, **kwargs):
        username = kwargs['username']
        
        # Get the specified user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" not found. Please create the user first.'))
            return

        # Clear existing items for this user
        ClothingItem.objects.filter(owner=user).delete()

        # Define realistic clothing items with appropriate combinations
        ITEMS = [
            # Shirts
            {"name": "White Oxford Button-Down", "category": "shirt", "color": "white", "weather_suitability": "cool", "size": "M", "brand": "Brooks Brothers"},
            {"name": "Light Blue Oxford", "category": "shirt", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "J.Crew"},
            {"name": "Navy Polo", "category": "shirt", "color": "blue", "weather_suitability": "warm", "size": "M", "brand": "Polo Ralph Lauren"},
            {"name": "White V-Neck Tee", "category": "shirt", "color": "white", "weather_suitability": "hot", "size": "M", "brand": "Uniqlo"},
            {"name": "Black Crew Neck Tee", "category": "shirt", "color": "black", "weather_suitability": "hot", "size": "M", "brand": "Everlane"},
            {"name": "Red Polo", "category": "shirt", "color": "red", "weather_suitability": "warm", "size": "M", "brand": "Lacoste"},
            {"name": "White Dress Shirt", "category": "shirt", "color": "white", "weather_suitability": "cool", "size": "15.5", "brand": "Charles Tyrwhitt"},
            {"name": "Blue Dress Shirt", "category": "shirt", "color": "blue", "weather_suitability": "cool", "size": "15.5", "brand": "Thomas Pink"},

            # Pants
            {"name": "Khaki Chinos", "category": "pants", "color": "yellow", "weather_suitability": "cool", "size": "32x32", "brand": "Dockers"},
            {"name": "Navy Chinos", "category": "pants", "color": "blue", "weather_suitability": "cool", "size": "32x32", "brand": "Bonobos"},
            {"name": "Blue Jeans", "category": "pants", "color": "blue", "weather_suitability": "cool", "size": "32x32", "brand": "Levi's"},
            {"name": "Black Dress Pants", "category": "pants", "color": "black", "weather_suitability": "cool", "size": "32x32", "brand": "Theory"},
            {"name": "Gray Wool Trousers", "category": "pants", "color": "white", "weather_suitability": "cold", "size": "32x32", "brand": "Brooks Brothers"},
            {"name": "Khaki Shorts", "category": "pants", "color": "yellow", "weather_suitability": "hot", "size": "32", "brand": "J.Crew"},
            {"name": "Navy Shorts", "category": "pants", "color": "blue", "weather_suitability": "hot", "size": "32", "brand": "Polo Ralph Lauren"},

            # Jackets
            {"name": "Navy Blazer", "category": "jacket", "color": "blue", "weather_suitability": "cool", "size": "40R", "brand": "Brooks Brothers"},
            {"name": "Black Leather Jacket", "category": "jacket", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "AllSaints"},
            {"name": "Navy Peacoat", "category": "jacket", "color": "blue", "weather_suitability": "cold", "size": "M", "brand": "J.Crew"},
            {"name": "Gray Rain Jacket", "category": "jacket", "color": "white", "weather_suitability": "rainy", "size": "M", "brand": "Patagonia"},
            {"name": "Black Down Puffer", "category": "jacket", "color": "black", "weather_suitability": "cold", "size": "M", "brand": "The North Face"},
            {"name": "Blue Denim Jacket", "category": "jacket", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "Levi's"},

            # Shoes
            {"name": "Brown Oxford Shoes", "category": "shoes", "color": "yellow", "weather_suitability": "cool", "size": "10", "brand": "Allen Edmonds"},
            {"name": "Black Derby Shoes", "category": "shoes", "color": "black", "weather_suitability": "cool", "size": "10", "brand": "Johnston & Murphy"},
            {"name": "White Sneakers", "category": "shoes", "color": "white", "weather_suitability": "warm", "size": "10", "brand": "Common Projects"},
            {"name": "Brown Boots", "category": "shoes", "color": "yellow", "weather_suitability": "cold", "size": "10", "brand": "Red Wing"},
            {"name": "Black Chelsea Boots", "category": "shoes", "color": "black", "weather_suitability": "cool", "size": "10", "brand": "Thursday Boot Co"},
            {"name": "Blue Canvas Sneakers", "category": "shoes", "color": "blue", "weather_suitability": "hot", "size": "10", "brand": "Converse"},

            # Accessories
            {"name": "Black Leather Belt", "category": "accessory", "color": "black", "weather_suitability": "cool", "size": "32", "brand": "Allen Edmonds"},
            {"name": "Brown Leather Belt", "category": "accessory", "color": "yellow", "weather_suitability": "cool", "size": "32", "brand": "Trafalgar"},
            {"name": "Navy Knit Tie", "category": "accessory", "color": "blue", "weather_suitability": "cool", "size": "One Size", "brand": "Drake's"},
            {"name": "Red Silk Tie", "category": "accessory", "color": "red", "weather_suitability": "cool", "size": "One Size", "brand": "Brooks Brothers"}
        ]

        # Create items for the specified user
        for item in ITEMS:
            ClothingItem.objects.create(owner=user, **item)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(ITEMS)} men\'s clothing items for user {username}')) 