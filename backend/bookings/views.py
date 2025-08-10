# backend/bookings/views.py
"""
API views for Bookings app.
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import Booking, Inquiry, Newsletter, Payment, Customer
from .serializers import (
    BookingListSerializer, BookingDetailSerializer, BookingCreateSerializer,
    InquirySerializer, InquiryCreateSerializer, NewsletterSerializer,
    PaymentCreateSerializer, CustomerSerializer
)

class BookingListCreateView(generics.ListCreateAPIView):
    """List user bookings and create new bookings"""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingListSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            # Return user's bookings if authenticated
            if hasattr(self.request.user, 'customer'):
                return Booking.objects.filter(
                    customer=self.request.user.customer
                ).select_related('tour', 'customer')
        return Booking.objects.none()
    
    def perform_create(self, serializer):
        booking = serializer.save()
        self.send_booking_confirmation_email(booking)
    
    def send_booking_confirmation_email(self, booking):
        """Send booking confirmation email"""
        subject = f"Booking Confirmation - {booking.booking_reference}"
        message = f"""
        Dear {booking.customer.full_name},
        
        Thank you for your booking with Richman Tours & Travel!
        
        Booking Details:
        - Booking Reference: {booking.booking_reference}
        - Tour: {booking.tour.title}
        - Departure Date: {booking.departure_date}
        - Number of Guests: {booking.total_guests}
        - Total Amount: KSh {booking.total_amount:,.2f}
        
        We will contact you soon to confirm your booking details.
        
        Best regards,
        Richman Tours & Travel Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],  # Send to admin
                fail_silently=True,
            )
        except Exception:
            pass  # Handle email sending gracefully

class NewsletterSubscribeView(generics.CreateAPIView):
    """Subscribe to newsletter"""
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        newsletter = serializer.save()
        
        return Response({
            'message': 'Successfully subscribed to newsletter!',
            'email': newsletter.email
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_unsubscribe(request):
    """Unsubscribe from newsletter"""
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        newsletter = Newsletter.objects.get(email=email, is_active=True)
        newsletter.is_active = False
        from django.utils import timezone
        newsletter.unsubscribed_at = timezone.now()
        newsletter.save()
        
        return Response({'message': 'Successfully unsubscribed from newsletter'})
    except Newsletter.DoesNotExist:
        return Response({'error': 'Email not found in newsletter list'}, 
                       status=status.HTTP_404_NOT_FOUND)

class PaymentCreateView(generics.CreateAPIView):
    """Create payment for a booking"""
    serializer_class = PaymentCreateSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        payment = serializer.save(status='pending')
        # Here you would integrate with payment gateway
        # For now, we'll mark as completed for demo purposes
        payment.status = 'completed'
        from django.utils import timezone
        payment.processed_at = timezone.now()
        payment.save()

@api_view(['GET'])
@permission_classes([AllowAny])
def booking_check(request):
    """Check booking status by reference and email"""
    booking_reference = request.GET.get('booking_reference')
    email = request.GET.get('email')
    
    if not booking_reference or not email:
        return Response({
            'error': 'Both booking_reference and email are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        booking = Booking.objects.get(
            booking_reference=booking_reference,
            customer__email=email
        )
        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)
    except Booking.DoesNotExist:
        return Response({
            'error': 'Booking not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form(request):
    """Handle contact form submissions"""
    serializer = InquiryCreateSerializer(data=request.data)
    if serializer.is_valid():
        inquiry = serializer.save(inquiry_type='general')
        
        # Send notification email
        subject = f"New Contact Form Submission: {inquiry.subject}"
        message = f"""
        New contact form submission received:
        
        Name: {inquiry.name}
        Email: {inquiry.email}
        Phone: {inquiry.phone_number or 'N/A'}
        Subject: {inquiry.subject}
        Message: {inquiry.message}
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
                fail_silently=True,
            )
        except Exception:
            pass
        
        return Response({
            'message': 'Your message has been sent successfully! We will get back to you soon.',
            'inquiry_id': inquiry.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def booking_stats(request):
    """Get booking statistics"""
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Count, Sum
    from datetime import date, timedelta
    
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    completed_bookings = Booking.objects.filter(status='completed').count()
    
    # Revenue stats
    total_revenue = Booking.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # This month's bookings
    today = date.today()
    first_day_month = today.replace(day=1)
    this_month_bookings = Booking.objects.filter(
        created_at__gte=first_day_month
    ).count()
    
    return Response({
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'confirmed_bookings': confirmed_bookings,
        'completed_bookings': completed_bookings,
        'total_revenue': float(total_revenue),
        'this_month_bookings': this_month_bookings,
    })DEFAULT_FROM_EMAIL,
                recipient_list=[booking.customer.email],
                fail_silently=True,
            )
        except Exception:
            pass  # Handle email sending gracefully

class BookingDetailView(generics.RetrieveAPIView):
    """Retrieve booking details"""
    serializer_class = BookingDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'booking_reference'
    
    def get_queryset(self):
        return Booking.objects.select_related('tour', 'customer').prefetch_related('guests', 'payments')

class CustomerBookingsView(generics.ListAPIView):
    """List bookings for a specific customer by email"""
    serializer_class = BookingListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        email = self.request.query_params.get('email')
        if email:
            return Booking.objects.filter(
                customer__email=email
            ).select_related('tour', 'customer').order_by('-created_at')
        return Booking.objects.none()

class InquiryListCreateView(generics.ListCreateAPIView):
    """List and create inquiries"""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InquiryCreateSerializer
        return InquirySerializer
    
    def get_queryset(self):
        # Only return inquiries if user is staff (for admin)
        if self.request.user.is_staff:
            return Inquiry.objects.all().select_related('tour')
        return Inquiry.objects.none()
    
    def perform_create(self, serializer):
        inquiry = serializer.save()
        self.send_inquiry_notification_email(inquiry)
    
    def send_inquiry_notification_email(self, inquiry):
        """Send inquiry notification to admin"""
        subject = f"New Inquiry: {inquiry.subject}"
        message = f"""
        New inquiry received from {inquiry.name}
        
        Details:
        - Name: {inquiry.name}
        - Email: {inquiry.email}
        - Phone: {inquiry.phone_number}
        - Type: {inquiry.get_inquiry_type_display()}
        - Subject: {inquiry.subject}
        - Message: {inquiry.message}
        
        Tour: {inquiry.tour.title if inquiry.tour else 'N/A'}
        Preferred Travel Dates: {inquiry.preferred_travel_dates or 'N/A'}
        Number of Travelers: {inquiry.number_of_travelers or 'N/A'}
        Budget Range: {inquiry.budget_range or 'N/A'}
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.
                