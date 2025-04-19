from django.core.management.base import BaseCommand
from wardrobe.models import ClothingItem
from django.contrib.auth.models import User
import random

class Command(BaseCommand):
    help = 'Seeds the database with realistic women\'s wardrobe items for specified user(s)'

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
            # Tops
            {"name": "White Button-Down Blouse", "category": "shirt", "color": "white", "weather_suitability": "cool", "size": "M", "brand": "Equipment"},
            {"name": "Silk Camisole", "category": "shirt", "color": "black", "weather_suitability": "warm", "size": "M", "brand": "Eileen Fisher"},
            {"name": "Striped Breton Tee", "category": "shirt", "color": "blue", "weather_suitability": "warm", "size": "M", "brand": "Saint James"},
            {"name": "Black Turtleneck", "category": "shirt", "color": "black", "weather_suitability": "cold", "size": "M", "brand": "Theory"},
            {"name": "Floral Blouse", "category": "shirt", "color": "red", "weather_suitability": "warm", "size": "M", "brand": "Reformation"},
            {"name": "White T-Shirt", "category": "shirt", "color": "white", "weather_suitability": "hot", "size": "M", "brand": "Everlane"},
            {"name": "Gray Sweater", "category": "shirt", "color": "white", "weather_suitability": "cold", "size": "M", "brand": "Aritzia"},
            {"name": "Pink Cashmere Sweater", "category": "shirt", "color": "red", "weather_suitability": "cold", "size": "M", "brand": "J.Crew"},
            {"name": "Denim Shirt", "category": "shirt", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "Madewell"},
            {"name": "Silk Tank Top", "category": "shirt", "color": "white", "weather_suitability": "hot", "size": "M", "brand": "Vince"},

            # Dresses
            {"name": "Little Black Dress", "category": "dress", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Theory"},
            {"name": "Floral Sundress", "category": "dress", "color": "red", "weather_suitability": "hot", "size": "M", "brand": "Reformation"},
            {"name": "Wrap Dress", "category": "dress", "color": "blue", "weather_suitability": "warm", "size": "M", "brand": "Diane von Furstenberg"},
            {"name": "Maxi Dress", "category": "dress", "color": "white", "weather_suitability": "hot", "size": "M", "brand": "Free People"},
            {"name": "Pencil Dress", "category": "dress", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Banana Republic"},
            {"name": "Shirt Dress", "category": "dress", "color": "blue", "weather_suitability": "warm", "size": "M", "brand": "J.Crew"},
            {"name": "Sweater Dress", "category": "dress", "color": "white", "weather_suitability": "cold", "size": "M", "brand": "Aritzia"},
            {"name": "Cocktail Dress", "category": "dress", "color": "red", "weather_suitability": "cool", "size": "M", "brand": "Reiss"},
            {"name": "Midi Dress", "category": "dress", "color": "blue", "weather_suitability": "warm", "size": "M", "brand": "& Other Stories"},
            {"name": "Slip Dress", "category": "dress", "color": "black", "weather_suitability": "warm", "size": "M", "brand": "Reformation"},

            # Bottoms
            {"name": "Black Skinny Jeans", "category": "pants", "color": "black", "weather_suitability": "cool", "size": "28", "brand": "AG"},
            {"name": "Blue Jeans", "category": "pants", "color": "blue", "weather_suitability": "cool", "size": "28", "brand": "Madewell"},
            {"name": "White Jeans", "category": "pants", "color": "white", "weather_suitability": "warm", "size": "28", "brand": "J.Crew"},
            {"name": "Black Slacks", "category": "pants", "color": "black", "weather_suitability": "cool", "size": "28", "brand": "Theory"},
            {"name": "Pleated Skirt", "category": "pants", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Aritzia"},
            {"name": "Denim Shorts", "category": "pants", "color": "blue", "weather_suitability": "hot", "size": "28", "brand": "Levi's"},
            {"name": "White Shorts", "category": "pants", "color": "white", "weather_suitability": "hot", "size": "28", "brand": "J.Crew"},
            {"name": "Pencil Skirt", "category": "pants", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Banana Republic"},
            {"name": "Pleated Midi Skirt", "category": "pants", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "& Other Stories"},
            {"name": "Leather Pants", "category": "pants", "color": "black", "weather_suitability": "cold", "size": "28", "brand": "AllSaints"},

            # Outerwear
            {"name": "Trench Coat", "category": "jacket", "color": "yellow", "weather_suitability": "rainy", "size": "M", "brand": "Burberry"},
            {"name": "Leather Jacket", "category": "jacket", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "AllSaints"},
            {"name": "Wool Coat", "category": "jacket", "color": "black", "weather_suitability": "cold", "size": "M", "brand": "Max Mara"},
            {"name": "Denim Jacket", "category": "jacket", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "Madewell"},
            {"name": "Blazer", "category": "jacket", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Theory"},
            {"name": "Rain Jacket", "category": "jacket", "color": "blue", "weather_suitability": "rainy", "size": "M", "brand": "Patagonia"},
            {"name": "Puffer Jacket", "category": "jacket", "color": "black", "weather_suitability": "cold", "size": "M", "brand": "The North Face"},
            {"name": "Cardigan", "category": "jacket", "color": "white", "weather_suitability": "cool", "size": "M", "brand": "Aritzia"},
            {"name": "Bomber Jacket", "category": "jacket", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Alpha Industries"},
            {"name": "Tweed Jacket", "category": "jacket", "color": "blue", "weather_suitability": "cool", "size": "M", "brand": "Chanel"},

            # Shoes
            {"name": "Black Pumps", "category": "shoes", "color": "black", "weather_suitability": "cool", "size": "8", "brand": "Jimmy Choo"},
            {"name": "White Sneakers", "category": "shoes", "color": "white", "weather_suitability": "warm", "size": "8", "brand": "Common Projects"},
            {"name": "Ankle Boots", "category": "shoes", "color": "black", "weather_suitability": "cold", "size": "8", "brand": "Stuart Weitzman"},
            {"name": "Ballet Flats", "category": "shoes", "color": "black", "weather_suitability": "warm", "size": "8", "brand": "Repetto"},
            {"name": "Sandals", "category": "shoes", "color": "black", "weather_suitability": "hot", "size": "8", "brand": "Birkenstock"},
            {"name": "Loafers", "category": "shoes", "color": "black", "weather_suitability": "cool", "size": "8", "brand": "Gucci"},
            {"name": "Espadrilles", "category": "shoes", "color": "blue", "weather_suitability": "hot", "size": "8", "brand": "Castaner"},
            {"name": "Chelsea Boots", "category": "shoes", "color": "black", "weather_suitability": "cold", "size": "8", "brand": "Blundstone"},
            {"name": "Mules", "category": "shoes", "color": "black", "weather_suitability": "warm", "size": "8", "brand": "The Row"},
            {"name": "Slingbacks", "category": "shoes", "color": "black", "weather_suitability": "warm", "size": "8", "brand": "Chanel"},

            # Accessories
            {"name": "Silk Scarf", "category": "accessory", "color": "red", "weather_suitability": "cool", "size": "One Size", "brand": "Hermès"},
            {"name": "Leather Belt", "category": "accessory", "color": "black", "weather_suitability": "cool", "size": "M", "brand": "Gucci"},
            {"name": "Tote Bag", "category": "accessory", "color": "black", "weather_suitability": "cool", "size": "One Size", "brand": "Celine"},
            {"name": "Crossbody Bag", "category": "accessory", "color": "black", "weather_suitability": "cool", "size": "One Size", "brand": "Chanel"},
            {"name": "Sunglasses", "category": "accessory", "color": "black", "weather_suitability": "hot", "size": "One Size", "brand": "Ray-Ban"},
            {"name": "Wool Scarf", "category": "accessory", "color": "blue", "weather_suitability": "cold", "size": "One Size", "brand": "Acne Studios"},
            {"name": "Leather Gloves", "category": "accessory", "color": "black", "weather_suitability": "cold", "size": "M", "brand": "Coach"},
            {"name": "Statement Necklace", "category": "accessory", "color": "white", "weather_suitability": "cool", "size": "One Size", "brand": "Jennifer Fisher"},
            {"name": "Wool Hat", "category": "accessory", "color": "black", "weather_suitability": "cold", "size": "One Size", "brand": "Acne Studios"},
            {"name": "Silk Hair Scarf", "category": "accessory", "color": "blue", "weather_suitability": "warm", "size": "One Size", "brand": "Dior"}
        ]

        # Create items for the specified user
        for item in ITEMS:
            ClothingItem.objects.create(owner=user, **item)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(ITEMS)} women\'s clothing items for user {username}')) 