from django.contrib import admin
from .models import Tour, GalleryImage, Contact, Testimonial, Booking

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['title', 'destination', 'duration', 'price', 'difficulty', 'featured', 'created_at']
    list_filter = ['difficulty', 'featured', 'destination']
    search_fields = ['title', 'destination', 'description']
    list_editable = ['featured', 'price']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'booking_reference', 'name', 'tour', 'preferred_date', 
        'number_of_people', 'status', 'total_amount', 'created_at'
    ]
    list_filter = ['status', 'tour', 'preferred_date', 'created_at']
    search_fields = ['booking_reference', 'name', 'email', 'tour__title']
    list_editable = ['status']
    readonly_fields = ['booking_reference', 'total_amount', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Customer Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Booking Details', {
            'fields': (
                'booking_reference', 'tour', 'preferred_date', 
                'number_of_people', 'total_amount', 'special_requirements'
            )
        }),
        ('Booking Management', {
            'fields': ('status', 'confirmed_date', 'confirmed_time', 'meeting_point', 'additional_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

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
    