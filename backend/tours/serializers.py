# backend/tours/serializers.py
"""
DRF serializers for Tours app.
"""
from rest_framework import serializers
from .models import Category, Destination, Tour, TourImage, Itinerary, Review

class CategorySerializer(serializers.ModelSerializer):
    tour_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'tour_count']
    
    def get_tour_count(self, obj):
        return obj.tours.filter(is_active=True).count()

class DestinationSerializer(serializers.ModelSerializer):
    tour_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Destination
        fields = ['id', 'name', 'slug', 'county', 'region', 'description', 
                 'latitude', 'longitude', 'image', 'is_featured', 'tour_count']
    
    def get_tour_count(self, obj):
        return obj.tours.filter(is_active=True).count()

class TourImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourImage
        fields = ['id', 'image', 'caption', 'order']

class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'day_number', 'title', 'description', 'accommodation', 'meals']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'name', 'rating', 'title', 'comment', 'created_at']
        read_only_fields = ['created_at']
    
    def create(self, validated_data):
        # Reviews need approval by default
        validated_data['is_approved'] = False
        return super().create(validated_data)

class TourListSerializer(serializers.ModelSerializer):
    """Serializer for tour list view with minimal data"""
    category = CategorySerializer(read_only=True)
    destinations = DestinationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tour
        fields = ['id', 'title', 'slug', 'category', 'destinations', 'price', 
                 'duration_days', 'duration_nights', 'featured_image', 'rating', 
                 'total_reviews', 'is_featured', 'difficulty']

class TourDetailSerializer(serializers.ModelSerializer):
    """Serializer for tour detail view with full data"""
    category = CategorySerializer(read_only=True)
    destinations = DestinationSerializer(many=True, read_only=True)
    images = TourImageSerializer(many=True, read_only=True)
    itinerary = ItinerarySerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    highlights_list = serializers.SerializerMethodField()
    includes_list = serializers.SerializerMethodField()
    excludes_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Tour
        fields = ['id', 'title', 'slug', 'category', 'destinations', 'description', 
                 'highlights', 'includes', 'excludes', 'highlights_list', 'includes_list', 
                 'excludes_list', 'price', 'duration_days', 'duration_nights', 
                 'max_group_size', 'min_age', 'difficulty', 'featured_image', 'images', 
                 'itinerary', 'reviews', 'rating', 'total_reviews', 'views_count', 
                 'is_featured', 'created_at']
    
    def get_highlights_list(self, obj):
        return obj.get_highlights_list()
    
    def get_includes_list(self, obj):
        return obj.get_includes_list()
    
    def get_excludes_list(self, obj):
        return obj.get_excludes_list()

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    class Meta:
        model = Review
        fields = ['tour', 'name', 'email', 'rating', 'title', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        # Reviews need approval by default
        validated_data['is_approved'] = False
        return super().create(validated_data)
        