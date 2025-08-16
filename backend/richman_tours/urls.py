from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('tours.urls')),  # Prefix API routes with /api/
    
    # Serve React static files
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'staticfiles')
    }),
]

# Add media files serving
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production, serve media files through Django
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]

# Catch-all pattern to serve React app for any non-API routes
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react-app'),
]
