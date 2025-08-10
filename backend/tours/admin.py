# backend/tours/admin.py
"""
Django admin configuration for Tours app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Category, Destination, Tour, TourImage, Itinerary, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tour_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def tour_count(self, obj):
        count = obj.tours.count()
        if count > 0:
            url = reverse('admin:tours_tour_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} tours</a>', url, count)
        return '0 tours'
    tour_count.short_description = 'Tours'

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ['name', 'county', 'region', 'is_featured', 'tour_count', 'created_at']
    list_filter = ['region', 'county', 'is_featured', 'created_at']
    search_fields = ['name', 'county', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_featured']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'county', 'region', 'description')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Media & Settings', {
            'fields': ('image', 'is_featured')
        }),
    )
    
    def tour_count(self, obj):
        count = obj.tours.count()
        if count > 0:
            return f'{count} tours'
        return '0 tours'
    tour_count.short_description = 'Tours'

class TourImageInline(admin.TabularInline):
    model = TourImage
    extra = 3
    fields = ['image', 'caption', 'order']
    
class ItineraryInline(admin.StackedInline):
    model = Itinerary
    extra = 1
    fields = ['day_number', 'title', 'description', 'accommodation', 'meals']

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'duration_display', 'difficulty', 
                   'is_active', 'is_featured', 'rating', 'views_count', 'created_at']
    list_filter = ['category', 'difficulty', 'is_active', 'is_featured', 'created_at', 
                  'destinations__region']
    search_fields = ['title', 'description', 'destinations__name']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_active', 'is_featured']
    readonly_fields = ['views_count', 'rating', 'total_reviews', 'created_at', 'updated_at']
    filter_horizontal = ['destinations']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'category', 'destinations', 'description')
        }),
        ('Tour Details', {
            'fields': ('highlights', 'includes', 'excludes')
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'duration_days', 'duration_nights', 'max_group_size', 
                      'min_age', 'difficulty')
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Status & Metadata', {
            'fields': ('is_active', 'is_featured', 'views_count', 'rating', 'total_reviews')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [TourImageInline, ItineraryInline]
    
    def duration_display(self, obj):
        if obj.duration_nights > 0:
            return f"{obj.duration_days} days / {obj.duration_nights} nights"
        return f"{obj.duration_days} day{'s' if obj.duration_days != 1 else ''}"
    duration_display.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category').prefetch_related('destinations')

@admin.register(TourImage)
class TourImageAdmin(admin.ModelAdmin):
    list_display = ['tour', 'image_preview', 'caption', 'order']
    list_filter = ['tour__category', 'tour__is_active']
    search_fields = ['tour__title', 'caption']
    list_editable = ['order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="40" style="object-fit: cover;" />', 
                             obj.image.url)
        return "No image"
    image_preview.short_description = 'Preview'

@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ['tour', 'day_number', 'title', 'accommodation']
    list_filter = ['tour__category', 'tour__is_active']
    search_fields = ['tour__title', 'title', 'description']
    list_editable = ['title']
    ordering = ['tour', 'day_number']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['name', 'tour', 'rating', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at', 'tour__category']
    search_fields = ['name', 'email', 'title', 'comment', 'tour__title']
    list_editable = ['is_approved']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('tour', 'name', 'email', 'rating', 'title', 'comment')
        }),
        ('Moderation', {
            'fields': ('is_approved',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_reviews', 'disapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} reviews were successfully approved.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def disapprove_reviews(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} reviews were successfully disapproved.')
    disapprove_reviews.short_description = 'Disapprove selected reviews'
    