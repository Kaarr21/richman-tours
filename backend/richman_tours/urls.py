# backend/richman_tours/urls.py - Updated
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# backend/richman_tours/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('', include('tours.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
