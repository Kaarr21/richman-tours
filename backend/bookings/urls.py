# backend/bookings/urls.py
"""
URL patterns for Bookings app API endpoints.
"""
from django.urls import path
from .views import (
    BookingListCreateView, BookingDetailView, CustomerBookingsView,
    InquiryListCreateView, NewsletterSubscribeView, PaymentCreateView,
    newsletter_unsubscribe, booking_check, contact_form, booking_stats
)

app_name = 'bookings'

urlpatterns = [
    # Bookings
    path('', BookingListCreateView.as_view(), name='booking-list-create'),
    path('<str:booking_reference>/', BookingDetailView.as_view(), name='booking-detail'),
    path('customer/bookings/', CustomerBookingsView.as_view(), name='customer-bookings'),
    path('check/', booking_check, name='booking-check'),
    path('stats/', booking_stats, name='booking-stats'),
    
    # Payments
    path('payments/create/', PaymentCreateView.as_view(), name='payment-create'),
    
    # Inquiries
    path('inquiries/', InquiryListCreateView.as_view(), name='inquiry-list-create'),
    path('contact/', contact_form, name='contact-form'),
    
    # Newsletter
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('newsletter/unsubscribe/', newsletter_unsubscribe, name='newsletter-unsubscribe'),
]
