from django.urls import path
from . import views

urlpatterns = [
    path('testpath', views.testview)
]
