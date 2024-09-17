#This is a management script that can be run whenever to update the list of restaurants in database

import requests
from django.conf import settings
from django.core.management.base import BaseCommand

from Restaurant_Search.models import Restaurant

LOCATION = '33.7490,-84.3880'
RADIUS = 5000
api_key = settings.GOOGLE_MAPS_API_KEY
TYPE = 'restaurant'
#Function to get all restaurant ids in the atlanta area
def fetch_restaurant_ids():
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location' : LOCATION,
        'radius' : RADIUS,
        'type' : TYPE,
        'key' : api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return [place['place_id'] for place in data.get('results', [])]
    else:
        print(f"Error fetching place IDs from Nearby Search API: {response.status_code}")
        return []
#Function to get details of the restaurant
def fetch_restaurant_details(restaurant_id):
    url = f"https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id' : restaurant_id,
        'key' : api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data.get('result')
    else:
        print(f"Error fetching details from Nearby Search API: {response.status_code}")
        return None
#Function to save restaurants to the database
class Command(BaseCommand):
    help = 'Fetch restaurants and save them to the database'

    def handle(self, *args, **kwargs):
        # This is where the logic to fetch and save restaurants should go
        place_ids = fetch_restaurant_ids()

        for place_id in place_ids:
            details = fetch_restaurant_details(place_id)

            if details:
                # Extract the relevant details
                name = details.get('name', 'No name available')
                latitude = details.get('geometry', {}).get('location', {}).get('lat', None)
                longitude = details.get('geometry', {}).get('location', {}).get('lng', None)
                address = details.get('formatted_address', 'Address not available')
                rating = details.get('rating', 'No rating available')
                opening_hours = details.get('opening_hours', {}).get('weekday_text', 'Hours not available')

                cuisine_type = next((t for t in details.get('types', []) if t not in ['restaurant', 'food', 'establishment']), 'Unknown')

                if latitude is not None and longitude is not None:
                    if not Restaurant.objects.filter(name=name, latitude=latitude, longitude=longitude).exists():
                        Restaurant.objects.create(
                            name=name,
                            address=address,
                            latitude=latitude,
                            longitude=longitude,
                            cuisine_type=cuisine_type,
                            rating=rating,
                            open_hours='\n'.join(opening_hours) if isinstance(opening_hours, list) else opening_hours
                        )
                        self.stdout.write(self.style.SUCCESS(f"Added restaurant: {name}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"Restaurant {name} already exists"))
                else:
                    self.stdout.write(self.style.WARNING(f"Skipping restaurant with place ID {place_id} due to missing coordinates"))
            else:
                self.stdout.write(self.style.WARNING(f"Could not fetch details for place ID: {place_id}"))

