from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .utils import create_otp, verify_otp
from .services import send_otp_sms
from .models import OTP
import logging

logger = logging.getLogger(__name__)

class RequestOTPView(APIView):
    """
    POST /api/otp/request/
    Input: { identifier: str, purpose: str }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        purpose = request.data.get('purpose')

        if not identifier or not purpose:
            return Response(
                {'error': 'identifier and purpose are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # validate purpose
        valid_purposes = dict(OTP.PURPOSE_CHOICES).keys()
        if purpose not in valid_purposes:
             return Response(
                {'error': f'Invalid purpose. Choices: {list(valid_purposes)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create OTP
        plain_otp = create_otp(identifier, purpose)
        
        # Send OTP via SMS
        send_otp_sms(identifier, plain_otp)
        
        # Log for dev/testing (PRODUCTION: Remove this log and integrate SMS gateway)
        logger.info(f"🔐 OTP Generated for {identifier} ({purpose}): {plain_otp}")
        print(f"🔐 OTP Generated for {identifier} ({purpose}): {plain_otp}") # Explicit print for console visibility

        return Response({
            'message': 'OTP sent successfully.',
            'identifier': identifier # optional echo
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    POST /api/otp/verify/
    Input: { identifier: str, purpose: str, otp: str }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        purpose = request.data.get('purpose')
        otp_input = request.data.get('otp')

        if not all([identifier, purpose, otp_input]):
            return Response(
                {'error': 'identifier, purpose, and otp are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        success, message = verify_otp(identifier, purpose, otp_input)

        if success:
            return Response({'message': message}, status=status.HTTP_200_OK)
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
