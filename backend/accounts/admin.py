# backend/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, LoginAttempt

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin with additional fields"""
    
    list_display = [
        'username', 'email', 'first_name', 'last_name', 
        'is_staff', 'is_admin', 'is_active', 'failed_login_attempts',
        'last_login', 'date_joined'
    ]
    
    list_filter = [
        'is_staff', 'is_admin', 'is_active', 'is_superuser',
        'date_joined', 'last_login'
    ]
    
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    ordering = ['-date_joined']
    
    readonly_fields = [
        'date_joined', 'last_login', 'last_login_ip',
        'failed_login_attempts', 'locked_until'
    ]
    
    # Add custom fields to the existing fieldsets
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': (
                'phone', 'is_admin', 'last_login_ip',
                'failed_login_attempts', 'locked_until'
            )
        }),
    )
    
    # Fields to show when adding a new user
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'phone', 'is_admin')
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related()
    
    def has_failed_logins(self, obj):
        """Display if user has failed login attempts"""
        if obj.failed_login_attempts > 0:
            return format_html(
                '<span style="color: red;">{} attempts</span>',
                obj.failed_login_attempts
            )
        return "None"
    has_failed_logins.short_description = "Failed Logins"
    
    def is_locked_status(self, obj):
        """Display account lock status"""
        if obj.is_locked():
            return format_html('<span style="color: red;">🔒 Locked</span>')
        return format_html('<span style="color: green;">🔓 Active</span>')
    is_locked_status.short_description = "Lock Status"
    
    # Add the custom methods to list display
    list_display = [
        'username', 'email', 'first_name', 'last_name', 
        'is_staff', 'is_admin', 'is_active', 
        'has_failed_logins', 'is_locked_status',
        'last_login', 'date_joined'
    ]
    
    actions = ['unlock_accounts', 'reset_failed_attempts']
    
    def unlock_accounts(self, request, queryset):
        """Admin action to unlock selected accounts"""
        count = 0
        for user in queryset:
            if user.is_locked():
                user.unlock_account()
                count += 1
        
        self.message_user(
            request,
            f'Successfully unlocked {count} user accounts.'
        )
    unlock_accounts.short_description = "Unlock selected accounts"
    
    def reset_failed_attempts(self, request, queryset):
        """Admin action to reset failed login attempts"""
        count = queryset.update(failed_login_attempts=0, locked_until=None)
        self.message_user(
            request,
            f'Reset failed login attempts for {count} users.'
        )
    reset_failed_attempts.short_description = "Reset failed login attempts"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """Admin interface for login attempts"""
    
    list_display = [
        'timestamp', 'username', 'ip_address', 'success',
        'user_link', 'user_agent_short'
    ]
    
    list_filter = [
        'success', 'timestamp', 'ip_address'
    ]
    
    search_fields = [
        'username', 'ip_address', 'user__email'
    ]
    
    readonly_fields = [
        'timestamp', 'ip_address', 'username', 'user',
        'success', 'user_agent'
    ]
    
    ordering = ['-timestamp']
    
    # Limit results for performance
    list_per_page = 50
    
    def user_link(self, obj):
        """Link to user admin page"""
        if obj.user:
            url = f"/admin/accounts/user/{obj.user.id}/change/"
            return format_html(
                '<a href="{}">{}</a>',
                url, obj.user.username
            )
        return "Unknown User"
    user_link.short_description = "User Account"
    
    def user_agent_short(self, obj):
        """Shortened user agent string"""
        if obj.user_agent:
            return obj.user_agent[:50] + "..." if len(obj.user_agent) > 50 else obj.user_agent
        return "Unknown"
    user_agent_short.short_description = "Browser"
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        """Prevent adding login attempts manually"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent editing login attempts"""
        return False
    
    # Add custom filters
    def changelist_view(self, request, extra_context=None):
        """Add custom context to changelist"""
        extra_context = extra_context or {}
        
        # Add summary statistics
        total_attempts = LoginAttempt.objects.count()
        successful_attempts = LoginAttempt.objects.filter(success=True).count()
        failed_attempts = LoginAttempt.objects.filter(success=False).count()
        success_rate = (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        extra_context['summary_stats'] = {
            'total_attempts': total_attempts,
            'successful_attempts': successful_attempts,
            'failed_attempts': failed_attempts,
            'success_rate': round(success_rate, 2)
        }
        
        return super().changelist_view(request, extra_context)


# Customize admin site headers
admin.site.site_header = "Richman Tours Admin"
admin.site.site_title = "Richman Tours Admin Portal"
admin.site.index_title = "Welcome to Richman Tours Administration"
