from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    place_id = models.CharField(max_length=500)
    address = models.CharField(max_length=1000, null=True, blank=True)
    cuisine = models.CharField(max_length=100, null=True, blank=True)
    rating = models.CharField(max_length=10, null=True, blank=True)
    openHours = models.CharField(max_length=1000, null=True, blank=True)
    latitude = models.CharField(max_length=5, null=True, blank=True)
    longitude = models.CharField(max_length=5, null=True, blank=True)
    website = models.CharField(max_length=700, null=True, blank=True)

    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}'s favorite: {self.restaurant.name}"