# tours/urls.py - Fixed version
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'tours', views.TourViewSet)
router.register(r'gallery', views.GalleryImageViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'testimonials', views.TestimonialViewSet)
router.register(r'bookings', views.BookingViewSet)

urlpatterns = [
    # Include router URLs (removes the redundant 'api/' prefix)
    path('', include(router.urls)),
    
    # Custom endpoints
    path('stats/', views.stats_view, name='stats'),
    path('analytics/dashboard/', views.analytics_dashboard, name='analytics_dashboard'),
    path('notifications/send-email/', views.send_custom_email, name='send_custom_email'),
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Additional endpoints
    path('bookings/<int:pk>/resend-confirmation/', 
         views.BookingViewSet.as_view({'post': 'resend_confirmation'}), 
         name='resend_booking_confirmation'),
    
    path('contacts/<int:pk>/mark-as-read/', 
         views.ContactViewSet.as_view({'patch': 'mark_as_read'}), 
         name='mark_contact_as_read'),
    
    # Enhanced admin endpoints
    path('dashboard/summary/', views.dashboard_summary, name='dashboard_summary'),
    path('bookings/calendar/', views.booking_calendar_view, name='booking_calendar'),
    path('bookings/bulk-action/', views.bulk_action_bookings, name='bulk_action_bookings'),
    path('reports/revenue/', views.revenue_report, name='revenue_report'),
    path('notifications/bulk-email/', views.send_bulk_email, name='send_bulk_email'),
]
