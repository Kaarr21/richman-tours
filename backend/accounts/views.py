# backend/accounts/views.py - Authentication Views
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer to include user data in token response"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_admin'] = getattr(user, 'is_admin', user.is_staff)
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff,
            'is_admin': getattr(self.user, 'is_admin', self.user.is_staff),
            'date_joined': self.user.date_joined.isoformat(),
        }
        
        # Log successful login
        logger.info(f"User {self.user.username} logged in successfully")
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with enhanced logging and error handling"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                username = request.data.get('username', 'unknown')
                logger.info(f"Successful login attempt for user: {username}")
            return response
        except Exception as e:
            username = request.data.get('username', 'unknown')
            logger.warning(f"Failed login attempt for user: {username} - {str(e)}")
            raise


class UserProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        user = request.user
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_admin': getattr(user, 'is_admin', user.is_staff),
            'date_joined': user.date_joined.isoformat(),
        }
        return Response(data)
    
    def patch(self, request):
        """Update user profile"""
        user = request.user
        data = request.data
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        
        user.save()
        
        logger.info(f"User {user.username} updated their profile")
        
        return Response({'message': 'Profile updated successfully'})


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not all([current_password, new_password, confirm_password]):
            return Response(
                {'error': 'All password fields are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'error': e.messages}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        logger.info(f"User {user.username} changed their password")
        
        return Response({'message': 'Password changed successfully'})


class UserListView(generics.ListAPIView):
    """List all users (admin only)"""
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        users = User.objects.all()
        data = []
        for user in users:
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            })
        
        return Response(data)


class UserDetailView(APIView):
    """Get, update, or delete a specific user (admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None
    
    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }
        
        return Response(data)
    
    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'is_staff' in data:
            user.is_staff = data['is_staff']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        user.save()
        
        logger.info(f"Admin {request.user.username} updated user {user.username}")
        
        return Response({'message': 'User updated successfully'})
    
    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if user == request.user:
            return Response(
                {'error': 'Cannot delete your own account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user.username
        user.delete()
        
        logger.info(f"Admin {request.user.username} deleted user {username}")
        
        return Response({'message': f'User {username} deleted successfully'})


class SecurityLogsView(APIView):
    """View security logs (admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        # This is a placeholder - implement according to your logging system
        # You might want to read from log files or a dedicated logging database
        
        logs = [
            {
                'timestamp': '2024-01-15T10:30:00Z',
                'event': 'login_success',
                'user': 'admin',
                'ip_address': '192.168.1.100'
            },
            {
                'timestamp': '2024-01-15T10:25:00Z',
                'event': 'login_failed',
                'user': 'unknown',
                'ip_address': '192.168.1.50'
            }
        ]
        
        return Response(logs)


# Override the default view
TokenObtainPairView.serializer_class = CustomTokenObtainPairSerializer
