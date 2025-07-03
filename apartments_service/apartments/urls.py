# apartments/urls.py
from django.urls import path
from . import views
from .views import apartment_list_api, profitable_apartments
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', views.apartment_list, name='apartment_list'),
    path('api/', views.apartment_list_api, name='apartment_list_api'),
    path('<int:pk>/', views.apartment_detail, name='apartment_detail'),
    path('map/', views.apartment_map, name='apartment_map'),
    path('geojson/', views.apartment_geojson, name='apartment_geojson'),
    path('api/forecast/<int:pk>/', views.apartment_forecast, name='apartment_forecast'),
    path('api/profitable_apartments/', profitable_apartments, name='profitable_apartments'),
    path('api/auth/register/', views.register_user, name='register'),
    path('api/auth/login/', views.login_user, name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
