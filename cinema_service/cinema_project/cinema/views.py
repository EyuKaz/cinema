from rest_framework import viewsets
from .models import Cinema, Auditorium, Seat
from .serializers import CinemaSerializer, AuditoriumSerializer, SeatSerializer

class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all().prefetch_related('auditoriums')
    serializer_class = CinemaSerializer

class AuditoriumViewSet(viewsets.ModelViewSet):
    queryset = Auditorium.objects.all().select_related('cinema').prefetch_related('seats')
    serializer_class = AuditoriumSerializer

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all().select_related('auditorium')
    serializer_class = SeatSerializer