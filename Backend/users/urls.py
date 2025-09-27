from django.urls import path
from .views import UserListView, AvailabilityCreateView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('availability/', AvailabilityCreateView.as_view(), name='availability-create'),
]
