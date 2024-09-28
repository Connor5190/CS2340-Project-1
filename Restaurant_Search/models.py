from django.db import models

# Create your models here.
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=1000)
    cuisine = models.CharField(max_length=100)
    rating = models.FloatField()
    openHours = models.CharField(max_length=1000)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)

    def __str__(self):
        return self.name
