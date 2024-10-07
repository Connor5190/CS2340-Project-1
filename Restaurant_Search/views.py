import json
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.views import View

def index(request):
    return render(request, 'Restaurant_Search/index.html');
def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('profile')
        else:
            return render(request, 'Restaurant_Search/login.html', {'error': 'Invalid credentials'})
    return render(request, 'Restaurant_Search/login.html')

@login_required
def profile_view(request):
    return render(request, "Restaurant_Search/profile.html", {'user': request.user})

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)  # 1
        if form.is_valid():  # 2
            user = form.save()  # 3
            login(request, user)  # 4
            messages.success(request, "Account created successfully!")  # 5
            return redirect('profile')  # 6
    else:
        form = UserCreationForm()  # 7
    return render(request, 'Restaurant_Search/signup.html', {'form': form})

def map_view(request):
    return render(request, 'Restaurant_Search/map.html')


from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from .models import Restaurant, Favorite

# The function will only accept POST requests.
# @require_POST
# @login_required  # Ensure that the user is logged in to add to favorites
# def favorite_restaurant(request):
#     # Extracting data from the POST request.
#     place_id = request.POST.get('place_id')
#     name = request.POST.get('name')
#     address = request.POST.get('address')
#     rating = request.POST.get('rating')
#
#     # Check if the required field 'place_id' is provided.
#     if not place_id or not name:
#         return JsonResponse({'status': 'error', 'message': 'Place ID and name are required'}, status=400)
#
#     # Check if the restaurant already exists in the database.
#     restaurant, created = Restaurant.objects.get_or_create(
#         place_id=place_id,
#         defaults={
#             'place_id': place_id,
#             'name': name,
#             'address': address,
#             'rating': rating,
#         }
#     )
#
#     # Check if the restaurant was successfully added to the Restaurant model.
#     if created:
#         # New restaurant created
#         restaurant_info = f'New restaurant {name} added to database'
#     else:
#         # Restaurant already exists
#         restaurant_info = f'Restaurant {name} already exists in the database'
#
#
#     # Now check if the restaurant is already in the user's favorites.
#     favorite_exists = Favorite.objects.filter(user=request.user, restaurant=restaurant).exists()
#
#     if favorite_exists:
#         # If the restaurant is already a favorite, return a message.
#         return JsonResponse({
#             'status': 'exists',
#             'restaurant_info': restaurant_info,
#             'message': f'Restaurant {name} is already in your favorites.'
#         })
#
#     # Otherwise, create the favorite entry.
#     Favorite.objects.create(user=request.user, restaurant=restaurant)
#
#
#     # Return a JSON response with status and information about the operation.
#     return JsonResponse({
#         'status': 'success',
#         'restaurant_info': restaurant_info,
#         'message': f'Restaurant {name} added to favorites.'
#     })


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Restaurant, Favorite


@csrf_exempt
def favorite_restaurant(request):
    print("made it!")
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            place_id = data.get("place_id")
            name = data.get("name")
            address = data.get("address")
            rating = data.get("rating")
            openHours = data.get("openHours")
            latitude = data.get("latitude")
            longitude = data.get("longitude")
            website = data.get("website")

            # Get or create the restaurant in the database
            restaurant, created = Restaurant.objects.get_or_create(
                place_id=place_id,
                defaults={"name": name,
                          "address": address,
                          "rating": rating,
                          "openHours": openHours,
                          "latitude": latitude,
                          "longitude": longitude,
                          "website": website
                          }
            )

            # Add to the user's favorites
            favorite, favorite_created = Favorite.objects.get_or_create(
                user=request.user,
                restaurant=restaurant
            )

            if favorite_created:
                return JsonResponse({"status": "success", "message": "Restaurant added to favorites."})
            else:
                return JsonResponse({"status": "info", "message": "Restaurant is already in your favorites."})

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid data"}, status=400)

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

def details_view(request, place_id):
    place = place_id  # Assuming you are using slugs

    context = {
        'place_id': place_id,
    }
    return render(request, 'Restaurant_Search/details.html', context)

# This method returns all of the place_id of favorites for a given user
@login_required
def get_user_favorites(request):
    user = request.user
    favorites = Favorite.objects.filter(user=user)

    favorite_restaurants = []
    for favorite in favorites:
        favorite_restaurants.append({
            'place_id': favorite.restaurant.place_id,
            'name': favorite.restaurant.name,
            'address': favorite.restaurant.address,
            'rating': favorite.restaurant.rating,
            'website': favorite.restaurant.website
        })

    return JsonResponse({'place_ids': favorite_restaurants})