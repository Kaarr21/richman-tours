# backend/tours/urls.py
"""
URL patterns for Tours app API endpoints.
"""
from django.urls import path
from .views import (
    CategoryListView, DestinationListView, TourListView, FeaturedToursView,
    TourDetailView, TourReviewsView, tour_search, tour_stats
)

app_name = 'tours'

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    
    # Destinations
    path('destinations/', DestinationListView.as_view(), name='destination-list'),
    
    # Tours
    path('', TourListView.as_view(), name='tour-list'),
    path('featured/', FeaturedToursView.as_view(), name='featured-tours'),
    path('search/', tour_search, name='tour-search'),
    path('stats/', tour_stats, name='tour-stats'),
    path('<slug:slug>/', TourDetailView.as_view(), name='tour-detail'),
    path('<slug:slug>/reviews/', TourReviewsView.as_view(), name='tour-reviews'),
]
