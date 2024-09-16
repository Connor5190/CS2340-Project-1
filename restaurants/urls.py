from django.urls import path
from . import views

urlpatterns = [
    path('map/', views.restaurant_map, name='restaurant_map'),
]