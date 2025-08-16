from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone
from datetime import timedelta
import logging

from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserSerializer, 
    ChangePasswordSerializer
)
from .models import User, LoginAttempt

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with security features"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                logger.info(f"Successful admin login: {request.data.get('username')}")
            return response
        except Exception as e:
            logger.warning(f"Failed login attempt: {request.data.get('username')} - {str(e)}")
            return Response(
                {'error': 'Authentication failed'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view"""
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except (TokenError, InvalidToken) as e:
            return Response(
                {'error': 'Token refresh failed'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout view that blacklists refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        logger.info(f"User logged out: {request.user.username}")
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    if not (request.user.is_staff or request.user.is_admin):
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """Change user password"""
    if not (request.user.is_staff or request.user.is_admin):
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        
        # Check current password
        if not user.check_password(serializer.validated_data['current_password']):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Update session to prevent logout
        update_session_auth_hash(request, user)
        
        logger.info(f"Password changed for user: {user.username}")
        return Response({'message': 'Password changed successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def security_logs_view(request):
    """Get security logs for admin review"""
    if not request.user.is_superuser:
        return Response({'error': 'Superuser access required'}, status=status.HTTP_403_FORBIDDEN)
    
    # Get recent login attempts (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    attempts = LoginAttempt.objects.filter(timestamp__gte=thirty_days_ago)
    
    data = []
    for attempt in attempts[:100]:  # Limit to 100 recent attempts
        data.append({
            'id': attempt.id,
            'username': attempt.username,
            'ip_address': attempt.ip_address,
            'success': attempt.success,
            'timestamp': attempt.timestamp.isoformat(),
            'user_agent': attempt.user_agent[:100] + '...' if len(attempt.user_agent) > 100 else attempt.user_agent
        })
    
    return Response({
        'login_attempts': data,
        'total_attempts': attempts.count(),
        'failed_attempts': attempts.filter(success=False).count(),
        'successful_attempts': attempts.filter(success=True).count(),
    })
