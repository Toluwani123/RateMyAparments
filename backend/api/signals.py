from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import UserVerification, User, RoommateProfile
from django.utils import timezone

@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    print(f"[DEBUG] send_verification_email fired for user={instance.username}, created={created}")  # ←
    if not created or instance.is_superuser:
        print(f"[DEBUG] skipping verification for superuser or existing user")
        return

    # 1️⃣ create the record
    uv = UserVerification.objects.create(
      user=instance,
      expired_at=timezone.now() + timezone.timedelta(minutes=15)
    )
    print(f"[DEBUG] Created UserVerification id={uv.id} code={uv.verification_code}")
    # 2️⃣ deactivate without signal recursion
    User.objects.filter(pk=instance.pk).update(is_active=False)
    print(f"[DEBUG] Marked user {instance.username} inactive")

    # 3️⃣ send the message
    subject = 'Your RateMyApartments verification code'
    message = (
        f"Hello {instance.username},\n\n"
        f"Your verification code is: {uv.verification_code}\n\n"
        "Please enter it on the verification page within 15 minutes."
    )
    from_email = settings.EMAIL_HOST_USER
    to_email   = [instance.email]

    print(f"[DEBUG] Sending email to {to_email} with subject={subject}")  # ←
    try:
        send_mail(subject, message, from_email, to_email, fail_silently=False)
        print(f"[DEBUG] send_mail() completed successfully")  # ←
    except Exception as e:
        print(f"[ERROR] send_mail failed: {e}")  # ←

@receiver(post_save, sender=User)
def create_user_roommate_profile(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'roommate_profile'):
        RoommateProfile.objects.create(user=instance)
            
