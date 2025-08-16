# backend/authentication/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    logout_view,
    profile_view,
    change_password_view,
    security_logs_view
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('change-password/', change_password_view, name='change_password'),
    path('security-logs/', security_logs_view, name='security_logs'),
]
