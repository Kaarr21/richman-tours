from django.db import models
from django.contrib.auth.models import User
import uuid

class Tour(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    destination = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)  # e.g., "7 days"
    price = models.DecimalField(max_digits=10, decimal_places=2)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    max_people = models.IntegerField(default=20)
    image = models.ImageField(upload_to='tours/', blank=True, null=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Customer Details
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Booking Details - Fixed to use ForeignKey to Tour
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='bookings', null=True, blank=True)
    destination = models.CharField(max_length=200)  # Keep this for custom destinations
    preferred_date = models.DateField()
    number_of_people = models.IntegerField(default=1)
    special_requirements = models.TextField(blank=True)
    
    # Booking Management
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Confirmed booking details
    confirmed_date = models.DateField(blank=True, null=True)
    confirmed_time = models.TimeField(blank=True, null=True)
    meeting_point = models.TextField(blank=True)
    additional_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_amount(self):
        """Calculate total amount based on final_price or estimated_price"""
        if self.final_price:
            return self.final_price
        elif self.estimated_price:
            return self.estimated_price
        elif self.tour:
            return self.tour.price * self.number_of_people
        return 0

    @property
    def tour_title(self):
        """Get tour title or use destination"""
        return self.tour.title if self.tour else self.destination

    @property
    def tour_destination(self):
        """Get tour destination or use destination field"""
        return self.tour.destination if self.tour else self.destination

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            self.booking_reference = str(uuid.uuid4())[:8].upper()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.tour_title} ({self.booking_reference})"

    class Meta:
        ordering = ['-created_at']


class GalleryImage(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='gallery/')
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='gallery_images', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.subject}"

    class Meta:
        ordering = ['-created_at']


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='testimonials')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.tour.title}"

    class Meta:
        ordering = ['-created_at']
        