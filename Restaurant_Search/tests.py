from django.test import TestCase

# Create your tests here.
from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from .models import Restaurant, Favorite

class FavoriteRestaurantTest(TestCase):

    def setUp(self):
        # Create a test user and log them in
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

    def test_add_favorite_restaurant(self):
        # Simulate adding a restaurant to favorites
        response = self.client.post(reverse('favorite_restaurant'), {
            'place_id': 'test_place_123',
            'name': 'Test Restaurant',
            'address': '123 Test St',
            'rating': '4.5',
        })

        # Check that the response is successful and contains the correct data
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'status': 'success', 'restaurant_info': 'New restaurant Test Restaurant added to database', 'message': 'Restaurant Test Restaurant added to favorites.'})

        # Check that the restaurant was added to the database
        restaurant = Restaurant.objects.get(place_id='test_place_123')
        self.assertEqual(restaurant.name, 'Test Restaurant')

        # Check that the restaurant is in the user's favorites
        favorite = Favorite.objects.get(user=self.user, restaurant=restaurant)
        self.assertIsNotNone(favorite)

    def test_add_existing_favorite_restaurant(self):
        # Create a restaurant in the database first
        restaurant = Restaurant.objects.create(
            place_id='test_place_123',
            name='Test Restaurant',
            address='123 Test St',
            rating='4.5',
        )

        # Simulate adding the restaurant to favorites
        response1 = self.client.post(reverse('favorite_restaurant'), {
            'place_id': 'test_place_123',
            'name': 'Test Restaurant',
            'address': '123 Test St',
            'rating': '4.5',
        })

        response = self.client.post(reverse('favorite_restaurant'), {
            'place_id': 'test_place_123',
            'name': 'Test Restaurant',
            'address': '123 Test St',
            'rating': '4.5',
        })

        # Check that the response is successful and the favorite was not duplicated
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {'status': 'exists', 'restaurant_info': 'Restaurant Test Restaurant already exists in the database', 'message': 'Restaurant Test Restaurant is already in your favorites.'})

        # Ensure the restaurant is only added once to the favorites
        favorites = Favorite.objects.filter(user=self.user, restaurant=restaurant)
        self.assertEqual(favorites.count(), 1)
