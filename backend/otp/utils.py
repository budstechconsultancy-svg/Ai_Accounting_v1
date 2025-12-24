import random
import string
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.hashers import make_password, check_password
from .models import OTP

def generate_otp(length=6):
    """Generate a numeric OTP of given length."""
    return ''.join(random.choices(string.digits, k=length))

def create_otp(identifier, purpose):
    """
    Create a new OTP for the given identifier and purpose.
    Invalidates any previous unused OTPs for the same identifier + purpose.
    Returns the raw plain-text OTP.
    """
    # Invalidate previous unused OTPs
    OTP.objects.filter(
        identifier=identifier,
        purpose=purpose,
        is_used=False
    ).update(is_used=True) # Mark as used effectively invalidates them for single-use check

    # Generate new OTP
    plain_otp = generate_otp()
    
    # Hash OTP (Never store plaintext)
    otp_hash = make_password(plain_otp)
    
    # Create record
    OTP.objects.create(
        identifier=identifier,
        purpose=purpose,
        otp_hash=otp_hash,
        expires_at=timezone.now() + timedelta(minutes=5),
        attempts=0,
        is_used=False
    )
    
    return plain_otp

def verify_otp(identifier, purpose, otp_input):
    """
    Verify the provided OTP.
    Returns:
        tuple: (success: bool, message: str)
    """
    # Fetch the latest active OTP
    try:
        otp_record = OTP.objects.filter(
            identifier=identifier,
            purpose=purpose,
            is_used=False
        ).latest('created_at')
    except OTP.DoesNotExist:
        return False, "Invalid or expired OTP."

    # Check expiry
    if otp_record.is_expired:
        return False, "OTP has expired."

    # Check max attempts (Max 5)
    if otp_record.attempts >= 5:
        return False, "Too many failed attempts. Please request a new OTP."

    # Verify Hash
    if check_password(otp_input, otp_record.otp_hash):
        # Success
        otp_record.is_used = True
        otp_record.save()
        return True, "OTP verified successfully."
    else:
        # Failure
        otp_record.attempts += 1
        otp_record.save()
        return False, "Incorrect OTP."
