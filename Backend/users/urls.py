from django.urls import path, include
from .views import UserListView, AvailabilityCreateView, SignUpView
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('availability/', AvailabilityCreateView.as_view(), name='availability-create'),
    path('accounts/login', auth_views.LoginView.as_view(template_name='registration/login.html')),
    path('accounts/signup/', SignUpView.as_view(template_name='registration/signup.html')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('home/', TemplateView.as_view(template_name = "home.html"))
]
