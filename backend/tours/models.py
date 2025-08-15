from django.db import models
from django.contrib.auth.models import User

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
    
    # Booking Details
    destination = models.CharField(max_length=200)  # Changed from tour to destination
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

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            import uuid
            self.booking_reference = str(uuid.uuid4())[:8].upper()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.destination} ({self.booking_reference})"

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
        