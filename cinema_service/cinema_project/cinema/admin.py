from django.contrib import admin
from .models import Cinema, Auditorium, Seat

# Register your models here.
admin.site.register(Cinema)
admin.site.register(Auditorium)
admin.site.register(Seat)
