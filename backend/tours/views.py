# backend/tours/views.py
"""
API views for Tours app.
"""
from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from .models import Category, Destination, Tour, Review
from .serializers import (
    CategorySerializer, DestinationSerializer, TourListSerializer, 
    TourDetailSerializer, ReviewSerializer, ReviewCreateSerializer
)
from .filters import TourFilter

class CategoryListView(generics.ListAPIView):
    """List all tour categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class DestinationListView(generics.ListAPIView):
    """List all destinations"""
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['region', 'county', 'is_featured']
    search_fields = ['name', 'county', 'description']

class TourListView(generics.ListAPIView):
    """List tours with filtering and search"""
    serializer_class = TourListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TourFilter
    search_fields = ['title', 'description', 'destinations__name', 'category__name']
    ordering_fields = ['price', 'duration_days', 'rating', 'created_at']
    ordering = ['-is_featured', '-created_at']
    
    def get_queryset(self):
        return Tour.objects.filter(is_active=True).select_related('category').prefetch_related('destinations')

class FeaturedToursView(generics.ListAPIView):
    """List featured tours"""
    serializer_class = TourListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Tour.objects.filter(is_active=True, is_featured=True).select_related('category').prefetch_related('destinations')[:6]

class TourDetailView(generics.RetrieveAPIView):
    """Retrieve tour details"""
    serializer_class = TourDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Tour.objects.filter(is_active=True).select_related('category').prefetch_related(
            'destinations', 'images', 'itinerary', 'reviews'
        )
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views count
        Tour.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class TourReviewsView(generics.ListCreateAPIView):
    """List and create tour reviews"""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        tour_slug = self.kwargs['slug']
        return Review.objects.filter(tour__slug=tour_slug, is_approved=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        tour_slug = self.kwargs['slug']
        tour = Tour.objects.get(slug=tour_slug)
        serializer.save(tour=tour)

@api_view(['GET'])
@permission_classes([AllowAny])
def tour_search(request):
    """Advanced tour search endpoint"""
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    region = request.GET.get('region', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    difficulty = request.GET.get('difficulty', '')
    
    tours = Tour.objects.filter(is_active=True)
    
    if query:
        tours = tours.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(destinations__name__icontains=query) |
            Q(category__name__icontains=query)
        ).distinct()
    
    if category:
        tours = tours.filter(category__slug=category)
    
    if region:
        tours = tours.filter(destinations__region=region)
    
    if min_price:
        tours = tours.filter(price__gte=min_price)
    
    if max_price:
        tours = tours.filter(price__lte=max_price)
    
    if difficulty:
        tours = tours.filter(difficulty=difficulty)
    
    tours = tours.select_related('category').prefetch_related('destinations')
    serializer = TourListSerializer(tours, many=True)
    
    return Response({
        'count': tours.count(),
        'results': serializer.data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def tour_stats(request):
    """Get tour statistics"""
    total_tours = Tour.objects.filter(is_active=True).count()
    total_destinations = Destination.objects.count()
    total_categories = Category.objects.count()
    featured_tours = Tour.objects.filter(is_active=True, is_featured=True).count()
    
    return Response({
        'total_tours': total_tours,
        'total_destinations': total_destinations,
        'total_categories': total_categories,
        'featured_tours': featured_tours
    })
    