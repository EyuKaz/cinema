from rest_framework import serializers
from .models import Cinema, Auditorium, Seat

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class AuditoriumSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    
    class Meta:
        model = Auditorium
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class CinemaSerializer(serializers.ModelSerializer):
    auditoriums = AuditoriumSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cinema
        fields = '__all__'
        read_only_fields = ('id', 'created_at')