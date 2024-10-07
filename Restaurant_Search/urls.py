from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.urls import path
from Restaurant_Search import views
from .views import get_user_favorites

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('profile/', views.profile_view, name='profile'),
    path('signup/', views.signup_view, name='signup'),
    path('map/search/', views.map_view, name='map'),
    path('favorite-restaurant/', views.favorite_restaurant, name='favorite_restaurant'),
    path('details/<slug:place_id>/', views.details_view, name='details'),
    path('api/user-favorites/', get_user_favorites, name='user_favorites'),
    path('', views.index, name='index')
]