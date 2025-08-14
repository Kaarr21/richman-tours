from django.contrib import admin

# Register your models here.
# tours/admin.py
from django.contrib import admin
from .models import Tour, GalleryImage, Contact, Testimonial

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['title', 'destination', 'duration', 'price', 'difficulty', 'featured', 'created_at']
    list_filter = ['difficulty', 'featured', 'destination']
    search_fields = ['title', 'destination', 'description']
    list_editable = ['featured', 'price']

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'tour', 'created_at']
    list_filter = ['tour', 'created_at']
    search_fields = ['title', 'description']

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['name', 'email', 'subject']
    list_editable = ['read']

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'tour', 'rating', 'created_at']
    list_filter = ['rating', 'tour', 'created_at']
    search_fields = ['name', 'comment']
