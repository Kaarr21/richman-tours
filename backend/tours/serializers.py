# tours/serializers.py
from rest_framework import serializers
from .models import Tour, GalleryImage, Contact, Testimonial, Booking

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'rating', 'comment', 'created_at']

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'title', 'description', 'image', 'created_at']

class TourSerializer(serializers.ModelSerializer):
    testimonials = TestimonialSerializer(many=True, read_only=True)
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'description', 'short_description', 'destination',
            'duration', 'price', 'difficulty', 'max_people', 'image', 'featured',
            'created_at', 'updated_at', 'testimonials', 'gallery_images'
        ]

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']

class BookingSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'name', 'email', 'phone', 'destination',
            'preferred_date', 'number_of_people', 'special_requirements',
            'status', 'status_display', 'booking_reference', 'estimated_price', 'final_price',
            'confirmed_date', 'confirmed_time', 'meeting_point', 'additional_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['booking_reference']

class BookingUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating booking details by admin
    """
    class Meta:
        model = Booking
        fields = [
            'status', 'confirmed_date', 'confirmed_time', 
            'meeting_point', 'additional_notes', 'final_price'
        ]
        