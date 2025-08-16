# tours/urls.py - Enhanced with full CRUD endpoints
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tours', views.TourViewSet)
router.register(r'gallery', views.GalleryImageViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'testimonials', views.TestimonialViewSet)
router.register(r'bookings', views.BookingViewSet)

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Statistics and analytics
    path('api/stats/', views.stats_view, name='stats'),
    path('api/analytics/dashboard/', views.analytics_dashboard, name='analytics_dashboard'),
    
    # Notification endpoints
    path('api/notifications/send-email/', views.send_custom_email, name='send_custom_email'),
]

# Additional endpoint patterns for advanced features
advanced_patterns = [
    # Bulk operations are handled through ViewSet actions
    # Individual CRUD operations are handled through standard ViewSet methods
    
    # Custom endpoints for specific functionality
    path('api/bookings/<int:pk>/resend-confirmation/', 
         views.BookingViewSet.as_view({'post': 'resend_confirmation'}), 
         name='resend_booking_confirmation'),
    
    path('api/contacts/<int:pk>/mark-as-read/', 
         views.ContactViewSet.as_view({'patch': 'mark_as_read'}), 
         name='mark_contact_as_read'),
]

urlpatterns.extend(advanced_patterns)
