# tours/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tours', views.TourViewSet)
router.register(r'gallery', views.GalleryImageViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'testimonials', views.TestimonialViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/stats/', views.stats_view, name='stats'),
]