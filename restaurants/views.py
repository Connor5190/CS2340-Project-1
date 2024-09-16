from django.shortcuts import render
from .models import Restaurant
from django.conf import settings


def restaurant_map(request):
    restaurants = Restaurant.objects.all()
    context = {
        'restaurants': restaurants,
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,  # Pass API key to template
    }
    return render(request, 'restaurants/map.html', context)
