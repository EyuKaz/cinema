from django.urls import path,include
from .views import CinemaViewSet, AuditoriumViewSet, SeatViewSet
from rest_framework import DefaultRouter
from .models import Cinema, Auditorium, Seat

router = DefaultRouter()
router.register(r'cinemas', CinemaViewSet)
router.register(r'auditoriums', AuditoriumViewSet)
router.register(r'seats', SeatViewSet)


urlpatterns = [
    path('', include(router.urls)),
]