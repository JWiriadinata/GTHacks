from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import make_aware
from datetime import datetime, time
from users.models import User, Availability
import pytz

class MatchUserView(APIView):
    """
    Match users by complementary languages and overlapping availability.
    """
    def post(self, request):
        user_id = request.data.get('user_id')
        day_of_week = int(request.data.get('day_of_week'))  # 0=Monday
        user = User.objects.get(id=user_id)

        # Get user's UTC availability for the given day
        user_avail = Availability.objects.filter(user=user, day_of_week=day_of_week)
        matches = []

        for avail in user_avail:
            # Convert user's local availability to UTC
            tz = pytz.timezone(user.timezone)
            start_utc = tz.localize(datetime.combine(datetime.today(), avail.start_time)).astimezone(pytz.UTC).time()
            end_utc = tz.localize(datetime.combine(datetime.today(), avail.end_time)).astimezone(pytz.UTC).time()

            # Find potential partners
            potential_partners = User.objects.filter(
                native_language=user.target_language,
                target_language=user.native_language
            ).exclude(id=user.id)

            for partner in potential_partners:
                partner_avails = Availability.objects.filter(user=partner, day_of_week=day_of_week)
                for pa in partner_avails:
                    partner_tz = pytz.timezone(partner.timezone)
                    partner_start_utc = partner_tz.localize(datetime.combine(datetime.today(), pa.start_time)).astimezone(pytz.UTC).time()
                    partner_end_utc = partner_tz.localize(datetime.combine(datetime.today(), pa.end_time)).astimezone(pytz.UTC).time()

                    # Check overlap
                    latest_start = max(start_utc, partner_start_utc)
                    earliest_end = min(end_utc, partner_end_utc)
                    if latest_start < earliest_end:
                        matches.append({
                            'partner_id': partner.id,
                            'partner_username': partner.username,
                            'overlap_start_utc': latest_start,
                            'overlap_end_utc': earliest_end,
                        })
        return Response(matches)
