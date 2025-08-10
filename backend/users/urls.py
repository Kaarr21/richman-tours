# backend/users/urls.py
"""
URL patterns for Users app API endpoints.
"""
from django.urls import path
from .views import (
    UserRegistrationView, UserProfileView, custom_login, 
    change_password, user_dashboard
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', custom_login, name='user-login'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', change_password, name='change-password'),
    path('dashboard/', user_dashboard, name='user-dashboard'),
]
