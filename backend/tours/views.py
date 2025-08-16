# tours/views.py - Enhanced with full CRUD operations
from django.shortcuts import render, get_object_or_404
from django.db.models import Q, Count
from django.http import JsonResponse, HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
import csv
import json
import logging

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

logger = logging.getLogger(__name__)

class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Tour.objects.all()
        
        # Filtering
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == 'true')
        
        destination = self.request.query_params.get('destination', None)
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(destination__icontains=search)
            )
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_tours = Tour.objects.filter(featured=True)
        serializer = self.get_serializer(featured_tours, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple tours at once"""
        tour_ids = request.data.get('tour_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not tour_ids:
            return Response({'error': 'No tour IDs provided'}, status=400)
        
        try:
            Tour.objects.filter(id__in=tour_ids).update(**update_data)
            return Response({'message': f'Updated {len(tour_ids)} tours successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple tours at once"""
        tour_ids = request.data.get('tour_ids', [])
        
        if not tour_ids:
            return Response({'error': 'No tour IDs provided'}, status=400)
        
        try:
            count = Tour.objects.filter(id__in=tour_ids).count()
            Tour.objects.filter(id__in=tour_ids).delete()
            return Response({'message': f'Deleted {count} tours successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        
        # Filtering
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(preferred_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(preferred_date__lte=end_date)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(booking_reference__icontains=search) |
                Q(destination__icontains=search)
            )
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new booking and send confirmation emails"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            
            # Send confirmation email to customer
            try:
                send_booking_confirmation_to_customer(booking)
                logger.info(f"Customer confirmation email sent for booking {booking.booking_reference}")
            except Exception as e:
                logger.error(f"Failed to send customer confirmation email: {str(e)}")
            
            # Send notification email to admin
            try:
                send_booking_notification_to_admin(booking)
                logger.info(f"Admin notification email sent for booking {booking.booking_reference}")
            except Exception as e:
                logger.error(f"Failed to send admin notification email: {str(e)}")
            
            return Response({
                'message': 'Your booking request has been submitted successfully! You will receive a confirmation email shortly.',
                'booking_reference': booking.booking_reference,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Update a booking with logging"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            booking = serializer.save()
            
            # Log status changes
            if old_status != booking.status:
                logger.info(f"Booking {booking.booking_reference} status changed from {old_status} to {booking.status}")
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a booking with logging"""
        instance = self.get_object()
        booking_reference = instance.booking_reference
        
        logger.info(f"Deleting booking {booking_reference}")
        instance.delete()
        
        return Response({
            'message': f'Booking {booking_reference} has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        """Confirm a booking and send final confirmation email"""
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
                logger.info(f"Final confirmation email sent for booking {updated_booking.booking_reference}")
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
        """Get all pending bookings for admin review"""
        pending_bookings = Booking.objects.filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def confirmed(self, request):
        """Get all confirmed bookings for schedule"""
        confirmed_bookings = Booking.objects.filter(status='confirmed').order_by('confirmed_date', 'confirmed_time')
        serializer = self.get_serializer(confirmed_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple bookings at once"""
        booking_ids = request.data.get('booking_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not booking_ids:
            return Response({'error': 'No booking IDs provided'}, status=400)
        
        try:
            count = Booking.objects.filter(id__in=booking_ids).update(**update_data)
            return Response({'message': f'Updated {count} bookings successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple bookings at once"""
        booking_ids = request.data.get('booking_ids', [])
        
        if not booking_ids:
            return Response({'error': 'No booking IDs provided'}, status=400)
        
        try:
            bookings = Booking.objects.filter(id__in=booking_ids)
            references = [b.booking_reference for b in bookings]
            count = bookings.count()
            bookings.delete()
            
            logger.info(f"Bulk deleted {count} bookings: {', '.join(references)}")
            return Response({'message': f'Deleted {count} bookings successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export bookings to CSV"""
        format_type = request.query_params.get('format', 'csv')
        
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="bookings_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Booking Reference', 'Name', 'Email', 'Phone', 'Tour/Destination',
                'Preferred Date', 'Confirmed Date', 'Number of People', 'Status',
                'Total Amount', 'Created At', 'Special Requirements'
            ])
            
            bookings = self.get_queryset()
            for booking in bookings:
                writer.writerow([
                    booking.booking_reference,
                    booking.name,
                    booking.email,
                    booking.phone,
                    booking.tour_title,
                    booking.preferred_date,
                    booking.confirmed_date or '',
                    booking.number_of_people,
                    booking.get_status_display(),
                    booking.total_amount,
                    booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    booking.special_requirements or ''
                ])
            
            return response
        
        return Response({'error': 'Unsupported format'}, status=400)
    
    @action(detail=True, methods=['post'])
    def resend_confirmation(self, request, pk=None):
        """Resend booking confirmation email"""
        booking = get_object_or_404(Booking, pk=pk)
        
        try:
            if booking.status == 'confirmed':
                send_booking_confirmation_final(booking)
            else:
                send_booking_confirmation_to_customer(booking)
            
            return Response({'message': 'Confirmation email resent successfully'})
        except Exception as e:
            logger.error(f"Failed to resend confirmation email: {str(e)}")
            return Response({'error': 'Failed to send email'}, status=400)

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = GalleryImage.objects.all()
        
        # Filter by tour
        tour_id = self.request.query_params.get('tour', None)
        if tour_id:
            queryset = queryset.filter(tour_id=tour_id)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def destroy(self, request, *args, **kwargs):
        """Delete a gallery image with logging"""
        instance = self.get_object()
        image_title = instance.title
        
        logger.info(f"Deleting gallery image: {image_title}")
        instance.delete()
        
        return Response({
            'message': f'Gallery image "{image_title}" has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Contact.objects.all()
        
        # Filter by read status
        read_filter = self.request.query_params.get('read', None)
        if read_filter is not None:
            queryset = queryset.filter(read=read_filter.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search) |
                Q(message__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()
            logger.info(f"New contact message received from {contact.email}")
            
            return Response({
                'message': 'Thank you for your message! We will get back to you soon.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark contact message as read"""
        contact = get_object_or_404(Contact, pk=pk)
        contact.read = True
        contact.save()
        
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a contact message with logging"""
        instance = self.get_object()
        contact_info = f"{instance.name} - {instance.subject}"
        
        logger.info(f"Deleting contact message: {contact_info}")
        instance.delete()
        
        return Response({
            'message': f'Contact message from "{instance.name}" has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Testimonial.objects.all()
        
        # Filter by tour
        tour_id = self.request.query_params.get('tour', None)
        if tour_id:
            queryset = queryset.filter(tour_id=tour_id)
        
        # Filter by rating
        rating = self.request.query_params.get('rating', None)
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(comment__icontains=search)
            )
        
        return queryset.order_by('-created_at')

@api_view(['GET'])
def stats_view(request):
    """API endpoint for dashboard statistics with enhanced analytics"""
    try:
        # Basic counts
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
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()
        
        # Recent stats (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
        recent_contacts = Contact.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Revenue calculation (confirmed bookings only)
        confirmed_bookings_qs = Booking.objects.filter(status='confirmed')
        total_revenue = sum(booking.total_amount for booking in confirmed_bookings_qs)
        
        # Monthly revenue (current month)
        current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_bookings = confirmed_bookings_qs.filter(created_at__gte=current_month_start)
        monthly_revenue = sum(booking.total_amount for booking in monthly_bookings)
        
        # Popular destinations
        popular_destinations = (
            Booking.objects
            .values('destination')
            .annotate(booking_count=Count('id'))
            .order_by('-booking_count')[:5]
        )
        
        stats = {
            # Basic counts
            'total_tours': total_tours,
            'featured_tours': featured_tours,
            'total_contacts': total_contacts,
            'unread_contacts': unread_contacts,
            'total_testimonials': total_testimonials,
            'total_gallery_images': total_gallery_images,
            
            # Booking stats
            'total_bookings': total_bookings,
            'pending_bookings': pending_bookings,
            'confirmed_bookings': confirmed_bookings,
            'cancelled_bookings': cancelled_bookings,
            
            # Recent activity
            'recent_bookings': recent_bookings,
            'recent_contacts': recent_contacts,
            
            # Revenue
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            
            # Popular destinations
            'popular_destinations': list(popular_destinations),
        }
        
        return Response(stats)
    
    except Exception as e:
        logger.error(f"Error generating stats: {str(e)}")
        return Response(
            {'error': 'Failed to generate statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def analytics_dashboard(request):
    """Enhanced analytics for dashboard"""
    period = request.GET.get('period', '30d')  # 7d, 30d, 90d, 1y
    
    # Calculate date range
    if period == '7d':
        start_date = datetime.now() - timedelta(days=7)
    elif period == '30d':
        start_date = datetime.now() - timedelta(days=30)
    elif period == '90d':
        start_date = datetime.now() - timedelta(days=90)
    elif period == '1y':
        start_date = datetime.now() - timedelta(days=365)
    else:
        start_date = datetime.now() - timedelta(days=30)
    
    # Booking trends
    bookings_over_time = []
    current = start_date
    while current <= datetime.now():
        next_day = current + timedelta(days=1)
        count = Booking.objects.filter(
            created_at__gte=current,
            created_at__lt=next_day
        ).count()
        bookings_over_time.append({
            'date': current.strftime('%Y-%m-%d'),
            'bookings': count
        })
        current = next_day
    
    # Revenue trends
    revenue_over_time = []
    current = start_date
    while current <= datetime.now():
        next_day = current + timedelta(days=1)
        revenue = sum(
            booking.total_amount for booking in 
            Booking.objects.filter(
                status='confirmed',
                created_at__gte=current,
                created_at__lt=next_day
            )
        )
        revenue_over_time.append({
            'date': current.strftime('%Y-%m-%d'),
            'revenue': float(revenue)
        })
        current = next_day
    
    return Response({
        'period': period,
        'bookings_over_time': bookings_over_time,
        'revenue_over_time': revenue_over_time,
    })

@api_view(['POST'])
def send_custom_email(request):
    """Send custom email to customers"""
    from .utils.email_utils import send_email
    
    to_email = request.data.get('to_email')
    subject = request.data.get('subject')
    content = request.data.get('content')
    
    if not all([to_email, subject, content]):
        return Response({'error': 'Missing required fields'}, status=400)
    
    try:
        success = send_email(to_email, subject, content)
        if success:
            return Response({'message': 'Email sent successfully'})
        else:
            return Response({'error': 'Failed to send email'}, status=400)
    except Exception as e:
        logger.error(f"Error sending custom email: {str(e)}")
        return Response({'error': str(e)}, status=400)
