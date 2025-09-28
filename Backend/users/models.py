from django.contrib.auth.models import AbstractUser
from django.db import models
import pytz

LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('it', 'Italian'),
    ('es', 'Spanish'),
    ('fr', 'French'),
    # Add more languages as needed
]

class User(AbstractUser):
    username = models.CharField(unique=True)
    password = models.CharField()
    native_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    target_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    timezone = models.CharField(max_length=50, choices=[(tz, tz) for tz in pytz.all_timezones])

class Availability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField()  # 0 = Monday, 6 = Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('user', 'day_of_week', 'start_time', 'end_time')
