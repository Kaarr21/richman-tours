# tours/views.py - Complete updated file with authentication
from django.shortcuts import render, get_object_or_404
from django.db.models import Q, Count
from django.http import JsonResponse, HttpResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
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


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    Regular users can only read.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users.
        return request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'is_admin', False))


class TourViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tours with proper authentication
    """
    queryset = Tour.objects.all()
    serializer_class = TourSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        """Get featured tours - public endpoint"""
        featured_tours = Tour.objects.filter(featured=True)
        serializer = self.get_serializer(featured_tours, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_update(self, request):
        """Update multiple tours at once - admin only"""
        tour_ids = request.data.get('tour_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not tour_ids:
            return Response({'error': 'No tour IDs provided'}, status=400)
        
        try:
            count = Tour.objects.filter(id__in=tour_ids).update(**update_data)
            logger.info(f"Admin {request.user.username} bulk updated {count} tours")
            return Response({'message': f'Updated {count} tours successfully'})
        except Exception as e:
            logger.error(f"Bulk update error: {str(e)}")
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_delete(self, request):
        """Delete multiple tours at once - admin only"""
        tour_ids = request.data.get('tour_ids', [])
        
        if not tour_ids:
            return Response({'error': 'No tour IDs provided'}, status=400)
        
        try:
            tours = Tour.objects.filter(id__in=tour_ids)
            tour_titles = [tour.title for tour in tours]
            count = tours.count()
            tours.delete()
            
            logger.info(f"Admin {request.user.username} bulk deleted {count} tours: {', '.join(tour_titles)}")
            return Response({'message': f'Deleted {count} tours successfully'})
        except Exception as e:
            logger.error(f"Bulk delete error: {str(e)}")
            return Response({'error': str(e)}, status=400)
    
    def create(self, request, *args, **kwargs):
        """Create tour with logging"""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            logger.info(f"Admin {request.user.username} created tour: {response.data.get('title')}")
        return response
    
    def update(self, request, *args, **kwargs):
        """Update tour with logging"""
        instance = self.get_object()
        old_title = instance.title
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200:
            logger.info(f"Admin {request.user.username} updated tour: {old_title}")
        return response
    
    def destroy(self, request, *args, **kwargs):
        """Delete tour with logging"""
        instance = self.get_object()
        tour_title = instance.title
        response = super().destroy(request, *args, **kwargs)
        if response.status_code == 204:
            logger.info(f"Admin {request.user.username} deleted tour: {tour_title}")
        return response


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings with authentication
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        """Allow public booking creation, but protect admin operations"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsAdminUser]
        else:
            # Custom actions like confirm, bulk operations, etc.
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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
        """Create a new booking and send confirmation emails - public endpoint"""
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
        """Update a booking with logging - admin only"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            booking = serializer.save()
            
            # Log status changes
            if old_status != booking.status:
                logger.info(f"Admin {request.user.username} changed booking {booking.booking_reference} status from {old_status} to {booking.status}")
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a booking with logging - admin only"""
        instance = self.get_object()
        booking_reference = instance.booking_reference
        
        logger.info(f"Admin {request.user.username} deleting booking {booking_reference}")
        instance.delete()
        
        return Response({
            'message': f'Booking {booking_reference} has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def confirm(self, request, pk=None):
        """Confirm a booking and send final confirmation email - admin only"""
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
                logger.info(f"Admin {request.user.username} confirmed booking {updated_booking.booking_reference} - final confirmation email sent")
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
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def pending(self, request):
        """Get all pending bookings for admin review"""
        pending_bookings = Booking.objects.filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(pending_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def confirmed(self, request):
        """Get all confirmed bookings for schedule"""
        confirmed_bookings = Booking.objects.filter(status='confirmed').order_by('confirmed_date', 'confirmed_time')
        serializer = self.get_serializer(confirmed_bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_update(self, request):
        """Update multiple bookings at once - admin only"""
        booking_ids = request.data.get('booking_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not booking_ids:
            return Response({'error': 'No booking IDs provided'}, status=400)
        
        try:
            count = Booking.objects.filter(id__in=booking_ids).update(**update_data)
            logger.info(f"Admin {request.user.username} bulk updated {count} bookings")
            return Response({'message': f'Updated {count} bookings successfully'})
        except Exception as e:
            logger.error(f"Bulk update error: {str(e)}")
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_delete(self, request):
        """Delete multiple bookings at once - admin only"""
        booking_ids = request.data.get('booking_ids', [])
        
        if not booking_ids:
            return Response({'error': 'No booking IDs provided'}, status=400)
        
        try:
            bookings = Booking.objects.filter(id__in=booking_ids)
            references = [b.booking_reference for b in bookings]
            count = bookings.count()
            bookings.delete()
            
            logger.info(f"Admin {request.user.username} bulk deleted {count} bookings: {', '.join(references)}")
            return Response({'message': f'Deleted {count} bookings successfully'})
        except Exception as e:
            logger.error(f"Bulk delete error: {str(e)}")
            return Response({'error': str(e)}, status=400)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminUser])
    def export(self, request):
        """Export bookings to CSV - admin only"""
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
            
            logger.info(f"Admin {request.user.username} exported bookings to CSV")
            return response
        
        return Response({'error': 'Unsupported format'}, status=400)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def resend_confirmation(self, request, pk=None):
        """Resend booking confirmation email - admin only"""
        booking = get_object_or_404(Booking, pk=pk)
        
        try:
            if booking.status == 'confirmed':
                send_booking_confirmation_final(booking)
            else:
                send_booking_confirmation_to_customer(booking)
            
            logger.info(f"Admin {request.user.username} resent confirmation email for booking {booking.booking_reference}")
            return Response({'message': 'Confirmation email resent successfully'})
        except Exception as e:
            logger.error(f"Failed to resend confirmation email: {str(e)}")
            return Response({'error': 'Failed to send email'}, status=400)


class GalleryImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing gallery images with authentication
    """
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    
    def get_permissions(self):
        """Allow viewing for all, but restrict modifications to admins"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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
    
    def create(self, request, *args, **kwargs):
        """Create gallery image with logging"""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            logger.info(f"Admin {request.user.username} added gallery image: {response.data.get('title')}")
        return response
    
    def destroy(self, request, *args, **kwargs):
        """Delete a gallery image with logging - admin only"""
        instance = self.get_object()
        image_title = instance.title
        
        logger.info(f"Admin {request.user.username} deleting gallery image: {image_title}")
        instance.delete()
        
        return Response({
            'message': f'Gallery image "{image_title}" has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)


class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing contact messages with authentication
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    
    def get_permissions(self):
        """Allow public contact creation, but restrict viewing to admins"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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
        """Create contact message - public endpoint"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.save()
            logger.info(f"New contact message received from {contact.email}")
            
            return Response({
                'message': 'Thank you for your message! We will get back to you soon.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def mark_as_read(self, request, pk=None):
        """Mark contact message as read - admin only"""
        contact = get_object_or_404(Contact, pk=pk)
        contact.read = True
        contact.save()
        
        logger.info(f"Admin {request.user.username} marked contact message from {contact.name} as read")
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a contact message with logging - admin only"""
        instance = self.get_object()
        contact_info = f"{instance.name} - {instance.subject}"
        
        logger.info(f"Admin {request.user.username} deleting contact message: {contact_info}")
        instance.delete()
        
        return Response({
            'message': f'Contact message from "{instance.name}" has been deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)


class TestimonialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing testimonials with authentication
    """
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    
    def get_permissions(self):
        """Allow viewing for all, but restrict modifications to admins"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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
    
    def create(self, request, *args, **kwargs):
        """Create testimonial with logging"""
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            logger.info(f"Admin {request.user.username} created testimonial from {response.data.get('name')}")
        return response
    
    def destroy(self, request, *args, **kwargs):
        """Delete testimonial with logging"""
        instance = self.get_object()
        testimonial_info = f"{instance.name} - {instance.rating} stars"
        
        logger.info(f"Admin {request.user.username} deleting testimonial: {testimonial_info}")
        response = super().destroy(request, *args, **kwargs)
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def stats_view(request):
    """API endpoint for dashboard statistics with enhanced analytics - admin only"""
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
        
        logger.info(f"Admin {request.user.username} accessed dashboard statistics")
        return Response(stats)
    
    except Exception as e:
        logger.error(f"Error generating stats: {str(e)}")
        return Response(
            {'error': 'Failed to generate statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def analytics_dashboard(request):
    """Enhanced analytics for dashboard - admin only"""
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
    
    logger.info(f"Admin {request.user.username} accessed analytics dashboard for period {period}")
    return Response({
        'period': period,
        'bookings_over_time': bookings_over_time,
        'revenue_over_time': revenue_over_time,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_custom_email(request):
    """Send custom email to customers - admin only"""
    from .utils.email_utils import send_email
    
    to_email = request.data.get('to_email')
    subject = request.data.get('subject')
    content = request.data.get('content')
    
    if not all([to_email, subject, content]):
        return Response({'error': 'Missing required fields'}, status=400)
    
    try:
        success = send_email(to_email, subject, content)
        if success:
            logger.info(f"Admin {request.user.username} sent custom email to {to_email}")
            return Response({'message': 'Email sent successfully'})
        else:
            return Response({'error': 'Failed to send email'}, status=400)
    except Exception as e:
        logger.error(f"Error sending custom email: {str(e)}")
        return Response({'error': str(e)}, status=400)


# Additional utility views for enhanced admin functionality

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def booking_calendar_view(request):
    """Get bookings organized by date for calendar view - admin only"""
    try:
        # Get date range from query params
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        queryset = Booking.objects.filter(status='confirmed')
        
        if start_date:
            queryset = queryset.filter(confirmed_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(confirmed_date__lte=end_date)
        
        # Group bookings by date
        calendar_data = {}
        for booking in queryset:
            date_key = booking.confirmed_date.strftime('%Y-%m-%d') if booking.confirmed_date else booking.preferred_date.strftime('%Y-%m-%d')
            
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            
            calendar_data[date_key].append({
                'id': booking.id,
                'booking_reference': booking.booking_reference,
                'customer_name': booking.name,
                'tour_title': booking.tour_title,
                'time': booking.confirmed_time.strftime('%H:%M') if booking.confirmed_time else None,
                'people_count': booking.number_of_people,
                'meeting_point': booking.meeting_point,
                'phone': booking.phone,
                'email': booking.email,
            })
        
        logger.info(f"Admin {request.user.username} accessed booking calendar")
        return Response(calendar_data)
        
    except Exception as e:
        logger.error(f"Error fetching calendar data: {str(e)}")
        return Response({'error': 'Failed to fetch calendar data'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_summary(request):
    """Get comprehensive dashboard summary - admin only"""
    try:
        # Today's stats
        today = datetime.now().date()
        today_bookings = Booking.objects.filter(created_at__date=today).count()
        today_contacts = Contact.objects.filter(created_at__date=today).count()
        today_revenue = sum(
            booking.total_amount for booking in 
            Booking.objects.filter(
                status='confirmed',
                created_at__date=today
            )
        )
        
        # This week's stats
        week_start = datetime.now().date() - timedelta(days=datetime.now().weekday())
        week_bookings = Booking.objects.filter(created_at__date__gte=week_start).count()
        week_revenue = sum(
            booking.total_amount for booking in 
            Booking.objects.filter(
                status='confirmed',
                created_at__date__gte=week_start
            )
        )
        
        # Upcoming tours (next 7 days)
        next_week = datetime.now().date() + timedelta(days=7)
        upcoming_bookings = Booking.objects.filter(
            status='confirmed',
            confirmed_date__gte=datetime.now().date(),
            confirmed_date__lte=next_week
        ).order_by('confirmed_date', 'confirmed_time')
        
        upcoming_tours = []
        for booking in upcoming_bookings[:10]:  # Limit to 10 upcoming
            upcoming_tours.append({
                'date': booking.confirmed_date.strftime('%Y-%m-%d'),
                'time': booking.confirmed_time.strftime('%H:%M') if booking.confirmed_time else 'TBD',
                'customer': booking.name,
                'tour': booking.tour_title,
                'people': booking.number_of_people,
                'reference': booking.booking_reference
            })
        
        # Recent activity
        recent_bookings = Booking.objects.order_by('-created_at')[:5]
        recent_contacts = Contact.objects.order_by('-created_at')[:5]
        
        recent_activity = []
        
        for booking in recent_bookings:
            recent_activity.append({
                'type': 'booking',
                'message': f"New booking from {booking.name} for {booking.tour_title}",
                'timestamp': booking.created_at.isoformat(),
                'status': booking.status
            })
        
        for contact in recent_contacts:
            recent_activity.append({
                'type': 'contact',
                'message': f"New message from {contact.name}: {contact.subject}",
                'timestamp': contact.created_at.isoformat(),
                'read': contact.read
            })
        
        # Sort recent activity by timestamp
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activity = recent_activity[:10]  # Limit to 10 most recent
        
        summary = {
            'today': {
                'bookings': today_bookings,
                'contacts': today_contacts,
                'revenue': float(today_revenue)
            },
            'this_week': {
                'bookings': week_bookings,
                'revenue': float(week_revenue)
            },
            'upcoming_tours': upcoming_tours,
            'recent_activity': recent_activity,
            'alerts': {
                'pending_bookings': Booking.objects.filter(status='pending').count(),
                'unread_contacts': Contact.objects.filter(read=False).count(),
            }
        }
        
        logger.info(f"Admin {request.user.username} accessed dashboard summary")
        return Response(summary)
        
    except Exception as e:
        logger.error(f"Error generating dashboard summary: {str(e)}")
        return Response({'error': 'Failed to generate dashboard summary'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def bulk_action_bookings(request):
    """Perform bulk actions on bookings - admin only"""
    try:
        action = request.data.get('action')
        booking_ids = request.data.get('booking_ids', [])
        
        if not action or not booking_ids:
            return Response({'error': 'Action and booking IDs are required'}, status=400)
        
        bookings = Booking.objects.filter(id__in=booking_ids)
        
        if action == 'confirm':
            count = bookings.update(status='confirmed')
            message = f'Confirmed {count} bookings'
            
        elif action == 'cancel':
            count = bookings.update(status='cancelled')
            message = f'Cancelled {count} bookings'
            
        elif action == 'delete':
            references = [b.booking_reference for b in bookings]
            count = bookings.count()
            bookings.delete()
            message = f'Deleted {count} bookings'
            logger.info(f"Admin {request.user.username} bulk deleted bookings: {', '.join(references)}")
            
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        logger.info(f"Admin {request.user.username} performed bulk action '{action}' on {count} bookings")
        return Response({'message': message, 'affected_count': count})
        
    except Exception as e:
        logger.error(f"Error performing bulk action: {str(e)}")
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_report(request):
    """Generate revenue report - admin only"""
    try:
        period = request.GET.get('period', 'month')  # day, week, month, year
        
        if period == 'day':
            start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = datetime.now().date() - timedelta(days=datetime.now().weekday())
            start_date = datetime.combine(start_date, datetime.min.time())
        elif period == 'month':
            start_date = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == 'year':
            start_date = datetime.now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return Response({'error': 'Invalid period'}, status=400)
        
        # Get confirmed bookings in the period
        bookings = Booking.objects.filter(
            status='confirmed',
            created_at__gte=start_date
        )
        
        total_revenue = sum(booking.total_amount for booking in bookings)
        booking_count = bookings.count()
        average_booking_value = total_revenue / booking_count if booking_count > 0 else 0
        
        # Revenue by tour/destination
        revenue_by_destination = {}
        for booking in bookings:
            dest = booking.tour_destination or booking.destination
            if dest not in revenue_by_destination:
                revenue_by_destination[dest] = {'revenue': 0, 'bookings': 0}
            revenue_by_destination[dest]['revenue'] += float(booking.total_amount)
            revenue_by_destination[dest]['bookings'] += 1
        
        # Sort by revenue
        top_destinations = sorted(
            revenue_by_destination.items(),
            key=lambda x: x[1]['revenue'],
            reverse=True
        )[:10]
        
        report = {
            'period': period,
            'start_date': start_date.isoformat(),
            'total_revenue': float(total_revenue),
            'booking_count': booking_count,
            'average_booking_value': float(average_booking_value),
            'top_destinations': [
                {
                    'destination': dest,
                    'revenue': data['revenue'],
                    'bookings': data['bookings'],
                    'avg_value': data['revenue'] / data['bookings']
                }
                for dest, data in top_destinations
            ]
        }
        
        logger.info(f"Admin {request.user.username} generated revenue report for {period}")
        return Response(report)
        
    except Exception as e:
        logger.error(f"Error generating revenue report: {str(e)}")
        return Response({'error': 'Failed to generate revenue report'}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def send_bulk_email(request):
    """Send bulk email to multiple recipients - admin only"""
    from .utils.email_utils import send_email
    
    try:
        recipients = request.data.get('recipients', [])  # List of email addresses
        subject = request.data.get('subject')
        content = request.data.get('content')
        
        if not all([recipients, subject, content]):
            return Response({'error': 'Recipients, subject, and content are required'}, status=400)
        
        if len(recipients) > 50:  # Limit bulk emails to prevent abuse
            return Response({'error': 'Maximum 50 recipients allowed'}, status=400)
        
        sent_count = 0
        failed_count = 0
        failed_emails = []
        
        for email in recipients:
            try:
                success = send_email(email, subject, content)
                if success:
                    sent_count += 1
                else:
                    failed_count += 1
                    failed_emails.append(email)
            except Exception as e:
                failed_count += 1
                failed_emails.append(email)
                logger.error(f"Failed to send email to {email}: {str(e)}")
        
        logger.info(f"Admin {request.user.username} sent bulk email to {sent_count} recipients, {failed_count} failed")
        
        return Response({
            'message': f'Bulk email sent to {sent_count} recipients',
            'sent_count': sent_count,
            'failed_count': failed_count,
            'failed_emails': failed_emails
        })
        
    except Exception as e:
        logger.error(f"Error sending bulk email: {str(e)}")
        return Response({'error': str(e)}, status=400)


# Health check endpoint for monitoring
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    try:
        # Basic database connectivity check
        tour_count = Tour.objects.count()
        
        return Response({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': 'connected',
            'tour_count': tour_count
        })
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }, status=500)
        