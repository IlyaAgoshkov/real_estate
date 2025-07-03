from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Apartment, User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass

admin.site.register(Apartment)
