# backend/tours/filters.py
"""
Django filters for Tours app.
"""
import django_filters
from .models import Tour, Category, Destination

class TourFilter(django_filters.FilterSet):
    """Filter for Tour model"""
    category = django_filters.ModelChoiceFilter(
        queryset=Category.objects.all(),
        field_name='category__slug',
        to_field_name='slug'
    )
    
    region = django_filters.ChoiceFilter(
        choices=Destination._meta.get_field('region').choices,
        field_name='destinations__region',
        method='filter_by_region'
    )
    
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    duration_min = django_filters.NumberFilter(field_name='duration_days', lookup_expr='gte')
    duration_max = django_filters.NumberFilter(field_name='duration_days', lookup_expr='lte')
    
    difficulty = django_filters.ChoiceFilter(choices=Tour.DIFFICULTY_CHOICES)
    
    is_featured = django_filters.BooleanFilter()
    
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    
    class Meta:
        model = Tour
        fields = ['category', 'region', 'difficulty', 'is_featured']
    
    def filter_by_region(self, queryset, name, value):
        """Filter tours by destination region"""
        return queryset.filter(destinations__region=value).distinct()
        