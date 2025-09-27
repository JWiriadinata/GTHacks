from django.urls import path
from .views import MatchUserView

urlpatterns = [
    path('find/', MatchUserView.as_view(), name='find-match'),
]
