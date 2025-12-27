import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_otp_sms(phone: str, otp: str) -> bool:
    """
    Send OTP via SMS using Twilio (production) or mock implementation (development)
    
    For production, configure these environment variables:
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_PHONE_NUMBER
    
    If not configured, falls back to mock implementation for development.
    """
    
    # Check if Twilio is configured
    twilio_configured = all([
        getattr(settings, 'TWILIO_ACCOUNT_SID', None),
        getattr(settings, 'TWILIO_AUTH_TOKEN', None),
        getattr(settings, 'TWILIO_PHONE_NUMBER', None)
    ])
    
    if twilio_configured:
        try:
            # Import Twilio SDK
            from twilio.rest import Client
            
            # Format phone number to E.164 if not already formatted
            if not phone.startswith('+'):
                # Assume Indian phone number if no country code
                formatted_phone = f'+91{phone}'
            else:
                formatted_phone = phone
            
            # Initialize Twilio client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            # Send SMS
            message = client.messages.create(
                body=f'Your OTP is {otp}. Valid for 5 minutes. Do not share this with anyone.',
                from_=settings.TWILIO_PHONE_NUMBER,
                to=formatted_phone
            )
            
            # Log success
            logger.info(f'✅ SMS sent successfully via Twilio to {formatted_phone}')
            logger.info(f'📱 Twilio Message SID: {message.sid}')
            
            print(f"\n{'='*60}")
            print(f"✅ TWILIO SMS SENT")
            print(f"To: {formatted_phone}")
            print(f"Message SID: {message.sid}")
            print(f"Status: {message.status}")
            print(f"{'='*60}\n")
            
            return True
            
        except ImportError:
            logger.error('❌ Twilio library not installed. Checking for mock fallback.')
            print("❌ Twilio SDK not installed. Please run `pip install twilio`.")
        except Exception as e:
            # Log error and fall back to mock
            logger.error(f'❌ Twilio SMS failed: {str(e)}')
            logger.warning(f'⚠️ Falling back to mock SMS service')
            print(f"\n{'='*60}")
            print(f"❌ TWILIO SMS FAILED: {str(e)}")
            print(f"⚠️ Falling back to mock SMS...")
            print(f"{'='*60}\n")
            
            # Fall through to mock implementation below
    
    # Mock implementation (development or fallback)
    logger.info(f"📱 MOCK SMS to {phone}: Your OTP is {otp}. Valid for 5 minutes.")
    
    print(f"\n{'='*60}")
    print(f"📱 MOCK SMS SERVICE (Development)")
    print(f"To: {phone}")
    print(f"Message: Your OTP is {otp}. Valid for 5 minutes.")
    print(f"{'='*60}\n")
    
    return True
