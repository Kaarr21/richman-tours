from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Tour, GalleryImage, Contact, Testimonial, Booking
from .serializers import (
    TourSerializer, GalleryImageSerializer, ContactSerializer, 
    TestimonialSerializer, BookingSerializer, BookingUpdateSerializer
)
from .utils.email_utils import (
    send_booking_confirmation_to_customer,
    send_booking_notification_to_admin,
    send_booking_confirmation_final
)
import logging

logger = logging.getLogger(__name__)

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

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new booking and send confirmation emails
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            
            # Send confirmation email to customer
            try:
                send_booking_confirmation_to_customer(booking)
            except Exception as e:
                logger.error(f"Failed to send customer confirmation email: {str(e)}")
            
            # Send notification email to admin
            try:
                send_booking_notification_to_admin(booking)
            except Exception as e:
                logger.error(f"Failed to send admin notification email: {str(e)}")
            
            return Response({
                'message': 'Your booking request has been submitted successfully! You will receive a confirmation email shortly.',
                'booking_reference': booking.booking_reference,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        """
        Confirm a booking and send final confirmation email
        """
        booking = get_object_or_404(Booking, pk=pk)
        serializer = BookingUpdateSerializer(booking, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Update booking status to confirmed if not already
            if booking.status != 'confirmed':
                serializer.validated_data['status'] = 'confirmed'
            
            updated_booking = serializer.save()
            
            # Send final confirmation email to customer
            try:
                send_booking_confirmation_final(updated_booking)
                return Response({
                    'message': 'Booking confirmed successfully! Confirmation email sent to customer.',
                    'data': BookingSerializer(updated_booking).data
                })
            except Exception as e:
                logger.error(f"Failed to send final confirmation email: {str(e)}")
                return Response({
                    'message': 'Booking confirmed but failed to send email.',
                    'data': BookingSerializer(updated_booking).data
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get all pending bookings for admin review
        """
        pending_bookings = Booking.objects.filter(status='pending')
        serializer = self.get_serializer(pending_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def confirmed(self, request):
        """
        Get all confirmed bookings for schedule
        """
        confirmed_bookings = Booking.objects.filter(status='confirmed').order_by('confirmed_date', 'confirmed_time')
        serializer = self.get_serializer(confirmed_bookings, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def stats_view(request):
    """API endpoint for dashboard statistics"""
    total_tours = Tour.objects.count()
    featured_tours = Tour.objects.filter(featured=True).count()
    total_contacts = Contact.objects.count()
    unread_contacts = Contact.objects.filter(read=False).count()
    total_testimonials = Testimonial.objects.count()
    total_gallery_images = GalleryImage.objects.count()
    
    # Booking stats
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    
    stats = {
        'total_tours': total_tours,
        'featured_tours': featured_tours,
        'total_contacts': total_contacts,
        'unread_contacts': unread_contacts,
        'total_testimonials': total_testimonials,
        'total_gallery_images': total_gallery_images,
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'confirmed_bookings': confirmed_bookings,
    }
    
    return Response(stats)
    