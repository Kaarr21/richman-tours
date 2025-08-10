# backend/bookings/serializers.py
"""
DRF serializers for Bookings app.
"""
from rest_framework import serializers
from .models import Customer, Booking, BookingGuest, Payment, Inquiry, Newsletter
from tours.serializers import TourListSerializer

class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone_number', 
                 'address', 'city', 'country', 'date_of_birth', 'nationality', 
                 'passport_number', 'dietary_requirements', 'medical_conditions']

class BookingGuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingGuest
        fields = ['id', 'guest_type', 'first_name', 'last_name', 'date_of_birth', 
                 'nationality', 'passport_number', 'dietary_requirements', 
                 'medical_conditions', 'special_assistance']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'reference_number', 
                 'transaction_id', 'status', 'processed_at', 'created_at']
        read_only_fields = ['created_at', 'processed_at']

class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for booking list view"""
    customer = CustomerSerializer(read_only=True)
    tour = TourListSerializer(read_only=True)
    days_until_departure = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_reference', 'tour', 'customer', 'departure_date', 
                 'return_date', 'total_guests', 'total_amount', 'status', 
                 'payment_status', 'days_until_departure', 'created_at']

class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for booking detail view"""
    customer = CustomerSerializer(read_only=True)
    tour = TourListSerializer(read_only=True)
    guests = BookingGuestSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    days_until_departure = serializers.ReadOnlyField()
    is_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'booking_reference', 'tour', 'customer', 
                 'departure_date', 'return_date', 'number_of_adults', 'number_of_children', 
                 'total_guests', 'adult_price', 'child_price', 'subtotal', 
                 'discount_amount', 'total_amount', 'amount_paid', 'balance_due', 
                 'status', 'payment_status', 'special_requests', 'guests', 'payments', 
                 'days_until_departure', 'is_paid', 'created_at', 'updated_at']

class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    customer = CustomerSerializer()
    guests = BookingGuestSerializer(many=True, required=False)
    
    class Meta:
        model = Booking
        fields = ['tour', 'customer', 'departure_date', 'return_date', 
                 'number_of_adults', 'number_of_children', 'special_requests', 'guests']
    
    def create(self, validated_data):
        customer_data = validated_data.pop('customer')
        guests_data = validated_data.pop('guests', [])
        
        # Create or get customer
        customer_email = customer_data['email']
        customer, created = Customer.objects.get_or_create(
            email=customer_email,
            defaults=customer_data
        )
        if not created:
            # Update existing customer data
            for key, value in customer_data.items():
                setattr(customer, key, value)
            customer.save()
        
        # Create booking
        tour = validated_data['tour']
        validated_data['customer'] = customer
        validated_data['adult_price'] = tour.price
        validated_data['child_price'] = tour.price * 0.7  # 30% discount for children
        
        booking = Booking.objects.create(**validated_data)
        
        # Create guests
        for guest_data in guests_data:
            BookingGuest.objects.create(booking=booking, **guest_data)
        
        return booking

class InquirySerializer(serializers.ModelSerializer):
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'phone_number', 'inquiry_type', 'subject', 
                 'message', 'tour', 'tour_title', 'preferred_travel_dates', 
                 'number_of_travelers', 'budget_range', 'source', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class InquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inquiries"""
    class Meta:
        model = Inquiry
        fields = ['name', 'email', 'phone_number', 'inquiry_type', 'subject', 
                 'message', 'tour', 'preferred_travel_dates', 'number_of_travelers', 
                 'budget_range', 'source']

class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['email', 'name']
    
    def create(self, validated_data):
        # Handle existing subscriptions
        email = validated_data['email']
        newsletter, created = Newsletter.objects.get_or_create(
            email=email,
            defaults=validated_data
        )
        if not created and not newsletter.is_active:
            # Reactivate subscription
            newsletter.is_active = True
            newsletter.unsubscribed_at = None
            newsletter.save()
        return newsletter

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    class Meta:
        model = Payment
        fields = ['booking', 'amount', 'payment_method', 'reference_number', 'notes']
    
    def validate_amount(self, value):
        booking = self.initial_data.get('booking')
        if booking:
            booking_obj = Booking.objects.get(id=booking)
            if value > booking_obj.balance_due:
                raise serializers.ValidationError("Payment amount cannot exceed balance due.")
        return value
        