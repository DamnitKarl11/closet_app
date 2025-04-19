from django.urls import path
from . import views
from accounts.views import create_initial_superuser  # ad

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
] 

urlpatterns += [
    path('init-superuser/', create_initial_superuser),
]