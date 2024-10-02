from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    place_id = models.CharField(max_length=500)
    address = models.CharField(max_length=1000)
    cuisine = models.CharField(max_length=100)
    rating = models.FloatField()
    openHours = models.CharField(max_length=1000)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}'s favorite: {self.restaurant.name}"