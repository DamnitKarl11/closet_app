from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clothing-items', views.ClothingItemViewSet, basename='clothing-item')
router.register(r'wear-logs', views.WearLogViewSet, basename='wear-log')
router.register(r'weather', views.WeatherViewSet, basename='weather')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check, name='health-check'),
] 