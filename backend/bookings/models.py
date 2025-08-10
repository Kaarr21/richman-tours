# backend/bookings/models.py
"""
Bookings app models for Richman Tours and Travel.
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator
from tours.models import Tour
import uuid

class Customer(models.Model):
    """Customer information for bookings"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    
    # Address Information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='Kenya')
    
    # Additional Info
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    passport_number = models.CharField(max_length=50, blank=True)
    dietary_requirements = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Booking(models.Model):
    """Main booking model"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('paid', 'Paid'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Booking Identification
    booking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    
    # Relations
    tour = models.ForeignKey(Tour, on_delete=models.PROTECT, related_name='bookings')
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='bookings')
    
    # Booking Details
    departure_date = models.DateField()
    return_date = models.DateField()
    number_of_adults = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    number_of_children = models.PositiveIntegerField(default=0)
    total_guests = models.PositiveIntegerField(default=1)
    
    # Pricing
    adult_price = models.DecimalField(max_digits=10, decimal_places=2)
    child_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Additional Information
    special_requests = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Internal notes")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking {self.booking_reference} - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        # Generate booking reference if not exists
        if not self.booking_reference:
            self.booking_reference = self.generate_booking_reference()
        
        # Calculate totals
        self.total_guests = self.number_of_adults + self.number_of_children
        self.subtotal = (self.adult_price * self.number_of_adults) + (self.child_price * self.number_of_children)
        self.total_amount = self.subtotal - self.discount_amount
        self.balance_due = self.total_amount - self.amount_paid
        
        super().save(*args, **kwargs)
    
    def generate_booking_reference(self):
        """Generate unique booking reference"""
        import random, string
        prefix = "RT"  # Richman Tours
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{prefix}{suffix}"
    
    @property
    def is_paid(self):
        return self.payment_status == 'paid'
    
    @property
    def days_until_departure(self):
        from datetime import date
        return (self.departure_date - date.today()).days

class BookingGuest(models.Model):
    """Individual guests in a booking"""
    GUEST_TYPE_CHOICES = [
        ('adult', 'Adult'),
        ('child', 'Child'),
        ('infant', 'Infant'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='guests')
    guest_type = models.CharField(max_length=10, choices=GUEST_TYPE_CHOICES, default='adult')
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    passport_number = models.CharField(max_length=50, blank=True)
    
    # Special Requirements
    dietary_requirements = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    special_assistance = models.TextField(blank=True)
    
    class Meta:
        ordering = ['booking', 'guest_type', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.guest_type})"

class Payment(models.Model):
    """Payment records for bookings"""
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Credit/Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_money', 'Mobile Money (M-Pesa)'),
        ('paypal', 'PayPal'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    
    # Payment Details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Status and Timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Additional Information
    notes = models.TextField(blank=True)
    receipt_number = models.CharField(max_length=50, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.amount} for {self.booking.booking_reference}"

class Inquiry(models.Model):
    """Customer inquiries and contact form submissions"""
    INQUIRY_TYPE_CHOICES = [
        ('general', 'General Inquiry'),
        ('booking', 'Booking Inquiry'),
        ('custom_tour', 'Custom Tour Request'),
        ('support', 'Support'),
        ('complaint', 'Complaint'),
        ('feedback', 'Feedback'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    # Contact Information
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.CharField(max_length=17, blank=True)
    
    # Inquiry Details
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES, default='general')
    subject = models.CharField(max_length=300)
    message = models.TextField()
    tour = models.ForeignKey(Tour, on_delete=models.SET_NULL, null=True, blank=True, 
                           related_name='inquiries')
    
    # Status and Assignment
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='assigned_inquiries')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Additional Fields
    preferred_travel_dates = models.DateField(null=True, blank=True)
    number_of_travelers = models.PositiveIntegerField(null=True, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=100, blank=True, help_text="How did they find us?")
    
    class Meta:
        verbose_name_plural = "Inquiries"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject}"

class Newsletter(models.Model):
    """Newsletter subscription model"""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-subscribed_at']
    
    def __str__(self):
        return self.email

# Signals to update booking payment status
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=Payment)
def update_booking_payment_status(sender, instance, **kwargs):
    """Update booking payment status when payment is created/updated/deleted"""
    booking = instance.booking
    total_paid = booking.payments.filter(status='completed').aggregate(
        total=models.Sum('amount')
    )['total'] or 0
    
    booking.amount_paid = total_paid
    booking.balance_due = booking.total_amount - total_paid
    
    # Update payment status
    if total_paid >= booking.total_amount:
        booking.payment_status = 'paid'
        if booking.status == 'pending':
            booking.status = 'confirmed'
    elif total_paid > 0:
        booking.payment_status = 'partial'
    else:
        booking.payment_status = 'pending'
    
    booking.save(update_fields=['amount_paid', 'balance_due', 'payment_status', 'status'])
    