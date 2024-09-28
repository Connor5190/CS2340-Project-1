from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.urls import path
from Restaurant_Search import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('profile/', views.profile_view, name='profile'),
    path('signup/', views.signup_view, name='signup'),
    path('map/search/', views.map_view, name='map'),
    path('favorites/', views.favorites_view, name='favorites'),
]