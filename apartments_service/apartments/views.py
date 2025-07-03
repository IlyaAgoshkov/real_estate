from django.shortcuts import render, get_object_or_404
from .models import Apartment, User
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Apartment
from .serializers import ApartmentSerializer, UserSerializer, LoginSerializer
from django.conf import settings
import joblib
import numpy as np
from django.http import JsonResponse, Http404
import os
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from django.core.paginator import Paginator
from django.views.decorators.http import require_GET
from django.core.cache import cache
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated

model = None
scaler = None

def load_models():
    global model, scaler
    if model is None or scaler is None:
        model_dir = os.path.join(os.path.dirname(__file__), 'model')
        model_path = os.path.join(model_dir, 'real_estate_predictor.h5')
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Файл модели не найден {model_path}")
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Файл шкалирования не найден {scaler_path}")
            
        try:
            model = tf.keras.models.load_model(model_path)
            scaler = joblib.load(scaler_path)
        except Exception as e:
            raise Exception(f"Ошибка загрузки файлов модели: {str(e)}")

@api_view(['GET'])
@permission_classes([AllowAny])
def apartment_list_api(request):
    queryset = Apartment.objects.all()

    # Фильтрация по цене
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    # Фильтрация по застройщику
    complex_name = request.GET.get('complex_name')
    if complex_name:
        queryset = queryset.filter(complex_name=complex_name)

    # Фильтрация по площади
    min_area = request.GET.get('min_area')
    max_area = request.GET.get('max_area')
    if min_area:
        queryset = queryset.filter(area__gte=min_area)
    if max_area:
        queryset = queryset.filter(area__lte=max_area)

    # Фильтрация по количеству комнат
    rooms = request.GET.get('rooms')
    if rooms:
        queryset = queryset.filter(rooms=rooms)

    # Фильтрация по этажу
    min_floor = request.GET.get('min_floor')
    max_floor = request.GET.get('max_floor')
    if min_floor:
        queryset = queryset.filter(floor__gte=min_floor)
    if max_floor:
        queryset = queryset.filter(floor__lte=max_floor)

    # Сортировка
    queryset = queryset.order_by('id')
    
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 12))

    paginator = Paginator(queryset, page_size)
    apartments_page = paginator.get_page(page)

    data = []
    for apt in apartments_page:
        image_url = None
        if apt.image:
            image_url = request.build_absolute_uri(apt.image.url)
        data.append({
            'id': apt.id,
            'title': apt.title,
            'rooms': apt.rooms,
            'address': apt.address,
            'floor': apt.floor,
            'area': apt.area,
            'price': apt.price,
            'price_per_m2': apt.price_per_m2,
            'complex_name': apt.complex_name,
            'image': image_url
        })

    return JsonResponse({
        'results': data,
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': apartments_page.number,
        'has_next': apartments_page.has_next(),
        'has_previous': apartments_page.has_previous(),
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def apartment_list(request):
    apartments = Apartment.objects.all()
    data = []
    for apt in apartments:
        image_url = None
        if apt.image:
            image_url = request.build_absolute_uri(apt.image.url)
        
        data.append({
            'id': apt.id,
            'title': apt.title,
            'rooms': apt.rooms,
            'address': apt.address,
            'floor': apt.floor,
            'area': apt.area,
            'price': apt.price,
            'price_per_m2': apt.price_per_m2,
            'complex_name': apt.complex_name,
            'image': image_url
        })
    return JsonResponse(data, safe=False)

def apartment_detail(request, pk):
    try:
        apartment = Apartment.objects.get(pk=pk)
        image_url = None
        if apartment.image:
            image_url = request.build_absolute_uri(apartment.image.url)
            
        data = {
            'id': apartment.id,
            'title': apartment.title,
            'image_url': image_url,
            'price': apartment.price,
            'price_per_m2': apartment.price_per_m2,
            'floor': apartment.floor,
            'rooms': apartment.rooms,
            'area': apartment.area,
            'address': apartment.address,
            'complex_name': apartment.complex_name,
            'usd_rub': apartment.usd_rub,
            'brent': apartment.brent
        }
        return JsonResponse(data)
    except Apartment.DoesNotExist:
        return JsonResponse({'error': 'Квартира не найдена'}, status=404)

def apartment_geojson(request):
    apartments = Apartment.objects.all()
    features = []
    
    for apt in apartments:
        if apt.latitude and apt.longitude:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [float(apt.longitude), float(apt.latitude)]
                },
                'properties': {
                    'id': apt.id,
                    'title': apt.title,
                    'price': apt.price_total,
                    'price_per_m2': apt.price_per_m2,
                    'rooms': apt.rooms,
                    'area': apt.area
                }
            }
            features.append(feature)
    
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }
    
    return JsonResponse(geojson)

def apartment_map(request):
    return render(request, 'apartments/map.html')

def apartment_forecast(request, pk):
    try:
        apt = Apartment.objects.get(pk=pk)
    except Apartment.DoesNotExist:
        raise Http404("Квартира не найдена")

    try:
        load_models()
        current_year = 2026
        forecast_years = list(range(current_year, current_year + 4))
        result = []
        prev_price = apt.price

        for year in forecast_years:
            X = np.array([[apt.price_per_m2, apt.floor, apt.rooms, apt.area, apt.usd_rub, apt.brent, year]])
            X_scaled = scaler.transform(X)
            y_pred = model.predict(X_scaled, verbose=0)[0][0]
            result.append({
                "year": year,
                "price": round(float(y_pred) * apt.area),
                "price_per_m2":  round(float(y_pred)),
            })
            prev_price = y_pred

        return JsonResponse(result, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def profitable_apartments(request):
    try:
        apartments = Apartment.objects.exclude(
            profit_percentage__isnull=True
        ).order_by('-profit_percentage')[:10]

        serializer = ApartmentSerializer(apartments, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


