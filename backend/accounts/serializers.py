# backend/authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, LoginAttempt

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    def validate(self, attrs):
        # Get IP address from request
        request = self.context.get('request')
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Track login attempt
        login_attempt = LoginAttempt.objects.create(
            ip_address=ip_address,
            username=username,
            user_agent=user_agent,
            success=False
        )
        
        try:
            user = User.objects.get(username=username)
            
            # Check if account is locked
            if user.is_locked():
                raise serializers.ValidationError(
                    'Account is temporarily locked due to failed login attempts. Try again later.'
                )
            
            # Authenticate user
            if not authenticate(username=username, password=password):
                user.increment_failed_attempts()
                raise serializers.ValidationError('Invalid credentials.')
            
            # Check if user is admin
            if not user.is_staff and not user.is_admin:
                raise serializers.ValidationError('Access denied. Admin privileges required.')
            
            # Successful login
            data = super().validate(attrs)
            
            # Update login attempt record
            login_attempt.user = user
            login_attempt.success = True
            login_attempt.save()
            
            # Reset failed attempts and update last login info
            user.unlock_account()
            user.last_login_ip = ip_address
            user.save()
            
            # Add user info to token response
            data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_admin': user.is_admin,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            }
            
            return data
            
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid credentials.')
    
    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class UserSerializer(serializers.ModelSerializer):
    """User serializer for profile management"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'is_staff', 'is_admin', 'last_login', 
            'last_login_ip', 'created_at'
        ]
        read_only_fields = ['id', 'last_login', 'last_login_ip', 'created_at']

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
