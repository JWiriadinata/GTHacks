from rest_framework import generics
from .models import User, Availability
from .serializers import UserSerializer, AvailabilitySerializer
from .forms import CustomUserCreationForm
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django import forms
from django.contrib.auth import get_user_model


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AvailabilityCreateView(generics.CreateAPIView):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer


class SignUpView(CreateView):
    User = get_user_model()
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

