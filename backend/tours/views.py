from django.shortcuts import render

# Create your views here.

# tours/models.py
from django.db import models
from django.contrib.auth.models import User
from .models import Tour, GalleryImage, Contact, Testimonial


# tours/serializers.py
from rest_framework import serializers
from .models import Tour, GalleryImage, Contact, Testimonial

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


# tours/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Tour, GalleryImage, Contact, Testimonial
from .serializers import TourSerializer, GalleryImageSerializer, ContactSerializer, TestimonialSerializer

class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_tours = Tour.objects.filter(featured=True)
        serializer = self.get_serializer(featured_tours, many=True)
        return Response(serializer.data)

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Thank you for your message! We will get back to you soon.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

@api_view(['GET'])
def stats_view(request):
    """API endpoint for dashboard statistics"""
    total_tours = Tour.objects.count()
    featured_tours = Tour.objects.filter(featured=True).count()
    total_contacts = Contact.objects.count()
    unread_contacts = Contact.objects.filter(read=False).count()
    total_testimonials = Testimonial.objects.count()
    total_gallery_images = GalleryImage.objects.count()
    
    stats = {
        'total_tours': total_tours,
        'featured_tours': featured_tours,
        'total_contacts': total_contacts,
        'unread_contacts': unread_contacts,
        'total_testimonials': total_testimonials,
        'total_gallery_images': total_gallery_images,
    }
    
    return Response(stats)
    