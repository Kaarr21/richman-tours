# backend/richman_tours/urls.py
"""
URL configuration for richman_tours project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# API URL patterns
api_urlpatterns = [
    # Authentication endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App endpoints
    path('tours/', include('tours.urls')),
    path('bookings/', include('bookings.urls')),
    path('users/', include('users.urls')),
]

# Main URL patterns
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(api_urlpatterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = "Richman Tours & Travel Administration"
admin.site.site_title = "Richman Tours Admin"
admin.site.index_title = "Welcome to Richman Tours & Travel Admin Panel"
