# backend/tours/models.py
"""
Tours app models for Richman Tours and Travel.
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from PIL import Image
import os

class Category(models.Model):
    """Tour categories (Safari, Beach, Mountain, Cultural, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="CSS class or icon name")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Destination(models.Model):
    """Tour destinations within Kenya"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    county = models.CharField(max_length=100)
    region = models.CharField(max_length=100, choices=[
        ('central', 'Central Kenya'),
        ('coast', 'Coast'),
        ('eastern', 'Eastern Kenya'),
        ('nairobi', 'Nairobi'),
        ('northern', 'Northern Kenya'),
        ('nyanza', 'Nyanza'),
        ('rift_valley', 'Rift Valley'),
        ('western', 'Western Kenya'),
    ])
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    image = models.ImageField(upload_to='destinations/', blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name}, {self.county}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Tour(models.Model):
    """Main tour packages offered by Richman Tours"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
        ('expert', 'Expert'),
    ]
    
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='tours')
    destinations = models.ManyToManyField(Destination, related_name='tours')
    
    # Tour Details
    description = models.TextField()
    highlights = models.TextField(help_text="Key highlights of the tour (one per line)")
    includes = models.TextField(help_text="What's included in the tour (one per line)")
    excludes = models.TextField(blank=True, help_text="What's not included (one per line)")
    
    # Pricing and Duration
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField()
    duration_nights = models.PositiveIntegerField()
    max_group_size = models.PositiveIntegerField(default=8)
    min_age = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='easy')
    
    # Media
    featured_image = models.ImageField(upload_to='tours/featured/')
    
    # Status and Metadata
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Resize featured image
        super().save(*args, **kwargs)
        if self.featured_image:
            self._resize_image(self.featured_image.path)
    
    def _resize_image(self, image_path):
        """Resize image to optimize storage and loading"""
        with Image.open(image_path) as img:
            if img.height > 800 or img.width > 1200:
                img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
                img.save(image_path, optimize=True, quality=85)
    
    def get_highlights_list(self):
        """Return highlights as a list"""
        return [h.strip() for h in self.highlights.split('\n') if h.strip()]
    
    def get_includes_list(self):
        """Return includes as a list"""
        return [i.strip() for i in self.includes.split('\n') if i.strip()]
    
    def get_excludes_list(self):
        """Return excludes as a list"""
        return [e.strip() for e in self.excludes.split('\n') if e.strip()]

class TourImage(models.Model):
    """Additional images for tours"""
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='tours/gallery/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.tour.title} - Image {self.id}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            self._resize_image(self.image.path)
    
    def _resize_image(self, image_path):
        """Resize image to optimize storage and loading"""
        with Image.open(image_path) as img:
            if img.height > 600 or img.width > 900:
                img.thumbnail((900, 600), Image.Resampling.LANCZOS)
                img.save(image_path, optimize=True, quality=85)

class Itinerary(models.Model):
    """Day-by-day itinerary for tours"""
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='itinerary')
    day_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    accommodation = models.CharField(max_length=200, blank=True)
    meals = models.CharField(max_length=100, blank=True, 
                           help_text="e.g., Breakfast, Lunch, Dinner")
    
    class Meta:
        unique_together = ['tour', 'day_number']
        ordering = ['tour', 'day_number']
    
    def __str__(self):
        return f"{self.tour.title} - Day {self.day_number}"

class Review(models.Model):
    """Customer reviews for tours"""
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='reviews')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['tour', 'email']  # One review per email per tour
    
    def __str__(self):
        return f"{self.name} - {self.tour.title} ({self.rating}/5)"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update tour rating when review is approved
        if self.is_approved:
            self.tour.update_rating()

# Signal to update tour rating when review approval status changes
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Review)
def update_tour_rating(sender, instance, **kwargs):
    """Update tour rating when review is saved"""
    if instance.is_approved:
        tour = instance.tour
        approved_reviews = tour.reviews.filter(is_approved=True)
        if approved_reviews.exists():
            avg_rating = approved_reviews.aggregate(
                avg=models.Avg('rating')
            )['avg']
            tour.rating = round(avg_rating, 2)
            tour.total_reviews = approved_reviews.count()
            tour.save(update_fields=['rating', 'total_reviews'])
            