# backend/richman_tours/urls.py - Main URL configuration
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import HttpResponse

def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse("OK", content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/auth/', include('accounts.urls')),  # Authentication endpoints
    path('api/', include('tours.urls')),          # Tours and other endpoints
    
    # Health check
    path('health/', health_check, name='health_check'),
    
    # Catch-all pattern for React routing (should be last)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Add catch-all for React routing in production
if not settings.DEBUG:
    # In production, all unmatched URLs should serve the React app
    from django.views.generic import TemplateView
    urlpatterns += [
        path('<path:path>', TemplateView.as_view(template_name='index.html')),
    ]
    