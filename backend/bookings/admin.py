# backend/bookings/admin.py
"""
Django admin configuration for Bookings app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Sum
from .models import Customer, Booking, BookingGuest, Payment, Inquiry, Newsletter

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone_number', 'country', 'booking_count', 'created_at']
    list_filter = ['country', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'nationality')
        }),
        ('Address Information', {
            'fields': ('address', 'city', 'country')
        }),
        ('Travel Information', {
            'fields': ('passport_number', 'dietary_requirements', 'medical_conditions'),
            'classes': ('collapse',)
        }),
        ('Account', {
            'fields': ('user',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def booking_count(self, obj):
        count = obj.bookings.count()
        if count > 0:
            url = reverse('admin:bookings_booking_changelist') + f'?customer__id__exact={obj.id}'
            return format_html('<a href="{}">{} bookings</a>', url, count)
        return '0 bookings'
    booking_count.short_description = 'Bookings'

class BookingGuestInline(admin.TabularInline):
    model = BookingGuest
    extra = 0
    fields = ['guest_type', 'first_name', 'last_name', 'date_of_birth', 'passport_number']

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['created_at']
    fields = ['amount', 'payment_method', 'status', 'reference_number', 'created_at']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_reference', 'customer_name', 'tour_title', 'departure_date', 
                   'total_guests', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'departure_date', 'created_at', 'tour__category']
    search_fields = ['booking_reference', 'customer__first_name', 'customer__last_name', 
                    'customer__email', 'tour__title']
    readonly_fields = ['booking_id', 'total_guests', 'subtotal', 'total_amount', 
                      'balance_due', 'created_at', 'updated_at']
    list_editable = ['status']
    date_hierarchy = 'departure_date'
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'booking_reference', 'tour', 'customer', 'status')
        }),
        ('Travel Details', {
            'fields': ('departure_date', 'return_date', 'number_of_adults', 'number_of_children', 
                      'total_guests', 'special_requests')
        }),
        ('Pricing', {
            'fields': ('adult_price', 'child_price', 'subtotal', 'discount_amount', 
                      'total_amount', 'amount_paid', 'balance_due', 'payment_status')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'cancelled_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [BookingGuestInline, PaymentInline]
    
    def customer_name(self, obj):
        return obj.customer.full_name
    customer_name.short_description = 'Customer'
    customer_name.admin_order_field = 'customer__last_name'
    
    def tour_title(self, obj):
        return obj.tour.title[:50] + ('...' if len(obj.tour.title) > 50 else '')
    tour_title.short_description = 'Tour'
    tour_title.admin_order_field = 'tour__title'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer', 'tour')

@admin.register(BookingGuest)
class BookingGuestAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'guest_type', 'booking_reference', 'date_of_birth']
    list_filter = ['guest_type', 'booking__status', 'booking__departure_date']
    search_fields = ['first_name', 'last_name', 'booking__booking_reference', 
                    'booking__customer__last_name']
    
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Name'
    
    def booking_reference(self, obj):
        return obj.booking.booking_reference
    booking_reference.short_description = 'Booking'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking_reference', 'amount', 'payment_method', 'status', 
                   'reference_number', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['booking__booking_reference', 'reference_number', 'transaction_id']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('booking', 'amount', 'payment_method', 'status')
        }),
        ('Transaction Details', {
            'fields': ('reference_number', 'transaction_id', 'receipt_number')
        }),
        ('Timestamps', {
            'fields': ('processed_at', 'created_at'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    def booking_reference(self, obj):
        return obj.booking.booking_reference
    booking_reference.short_description = 'Booking'
    booking_reference.admin_order_field = 'booking__booking_reference'

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'inquiry_type', 'subject', 'status', 'assigned_to', 'created_at']
    list_filter = ['inquiry_type', 'status', 'created_at', 'tour__category']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['status', 'assigned_to']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone_number')
        }),
        ('Inquiry Details', {
            'fields': ('inquiry_type', 'subject', 'message', 'tour')
        }),
        ('Travel Preferences', {
            'fields': ('preferred_travel_dates', 'number_of_travelers', 'budget_range'),
            'classes': ('collapse',)
        }),
        ('Management', {
            'fields': ('status', 'assigned_to', 'source')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_resolved', 'mark_as_in_progress']
    
    def mark_as_resolved(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='resolved', resolved_at=timezone.now())
        self.message_user(request, f'{updated} inquiries were marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected inquiries as resolved'
    
    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'{updated} inquiries were marked as in progress.')
    mark_as_in_progress.short_description = 'Mark selected inquiries as in progress'

@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email', 'name']
    list_editable = ['is_active']
    readonly_fields = ['subscribed_at', 'unsubscribed_at']
    
    actions = ['activate_subscriptions', 'deactivate_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        updated = queryset.update(is_active=True, unsubscribed_at=None)
        self.message_user(request, f'{updated} subscriptions were activated.')
    activate_subscriptions.short_description = 'Activate selected subscriptions'
    
    def deactivate_subscriptions(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f'{updated} subscriptions were deactivated.')
    deactivate_subscriptions.short_description = 'Deactivate selected subscriptions'
    