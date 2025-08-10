# backend/users/admin.py
"""
Django admin configuration for Users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ['phone_number', 'date_of_birth', 'address', 'city', 'country', 
              'avatar', 'receive_newsletters', 'receive_booking_updates']

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 
                   'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'city', 'country', 'receive_newsletters']
    list_filter = ['country', 'receive_newsletters', 'receive_booking_updates']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 
                    'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    