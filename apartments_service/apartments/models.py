from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

class Apartment(models.Model):
    title = models.CharField(max_length=255)
    rooms = models.IntegerField()
    address = models.CharField(max_length=255)
    floor = models.IntegerField()
    area = models.FloatField()
    price = models.IntegerField()
    price_per_m2 = models.IntegerField()
    complex_name = models.CharField(max_length=100)
    date = models.IntegerField()
    image = models.ImageField(upload_to='apartment_photos/', null=True, blank=True)
    usd_rub = models.FloatField(default=79.1)
    brent = models.FloatField(default=64.6)
    forecast_price_next_year = models.FloatField(null=True, blank=True)
    profit_percentage = models.FloatField(null=True, blank=True, help_text='Процент ожидаемой прибыли на основе прогнозной цены')

    def __str__(self):
        return f"{self.complex_name} – {self.title}"
