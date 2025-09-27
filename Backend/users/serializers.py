from rest_framework import serializers
from .models import User, Availability

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['day_of_week', 'start_time', 'end_time']

class UserSerializer(serializers.ModelSerializer):
    availabilities = AvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'native_language', 'target_language', 'timezone', 'availabilities']
