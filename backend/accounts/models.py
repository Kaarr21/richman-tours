# backend/authentication/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    """Extended User model with additional fields"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    is_admin = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def is_locked(self):
        """Check if account is locked due to failed login attempts"""
        if self.locked_until:
            return timezone.now() < self.locked_until
        return False

    def lock_account(self, duration_minutes=5):
        """Lock account for specified duration"""
        self.locked_until = timezone.now() + timedelta(minutes=duration_minutes)
        self.save()

    def unlock_account(self):
        """Unlock account and reset failed attempts"""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()

    def increment_failed_attempts(self):
        """Increment failed login attempts"""
        from django.conf import settings
        
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= getattr(settings, 'LOGIN_ATTEMPT_LIMIT', 5):
            lockout_time = getattr(settings, 'LOGIN_LOCKOUT_TIME', 300)
            self.lock_account(lockout_time // 60)
        self.save()

class LoginAttempt(models.Model):
    """Track login attempts for security monitoring"""
    ip_address = models.GenericIPAddressField()
    username = models.CharField(max_length=150)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    success = models.BooleanField(default=False)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.username} - {self.ip_address} - {'Success' if self.success else 'Failed'}"
