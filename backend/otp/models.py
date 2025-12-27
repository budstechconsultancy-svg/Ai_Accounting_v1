from django.db import models
from django.utils import timezone

class OTP(models.Model):
    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('signup', 'Signup'),
        ('reset', 'Password Reset'),
    ]

    identifier = models.CharField(max_length=255, db_index=True)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, db_index=True)
    otp_hash = models.CharField(max_length=255)
    attempts = models.IntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_records'
        indexes = [
            models.Index(fields=['identifier', 'purpose']),
        ]
        verbose_name = 'OTP Record'
        verbose_name_plural = 'OTP Records'

    def __str__(self):
        return f"{self.identifier} ({self.purpose})"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
