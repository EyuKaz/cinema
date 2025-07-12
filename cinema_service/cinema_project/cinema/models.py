from django.db import models

# Create your models here.
class Cinema(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.city} - {self.address}"
    
    class Meta:
        verbose_name = 'Cinema'
        verbose_name_plural = 'Cinemas'

class Auditorium(models.Model):
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    seat_map = models.JSONField() 
    seat_rows = models.PositiveIntegerField()  # Total rows (e.g., 10)
    seat_columns = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} @ {self.cinema.name}"

class Seat(models.Model):
    auditorium = models.ForeignKey(Auditorium, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=2)  # e.g., A, B, C
    number = models.PositiveIntegerField()  # e.g., 1, 2, 3
    seat_type = models.CharField(max_length=50, choices=[
        ('standard', 'Standard'),
        ('vip', 'VIP'),
        ('accessible', 'Accessible'),
    ], default='standard')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Seat {self.row}{self.number} - {self.auditorium.name}"
    
    class meta:
        verbose_name = 'Seat'
        verbose_name_plural = 'Seats'
        unique_together = ('auditorium', 'row', 'number')