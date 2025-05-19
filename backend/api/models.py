from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from .listforstates import *
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class User(AbstractUser):
    campus = models.ForeignKey(
        'Campus',
        on_delete=models.PROTECT,
        null=True,           # or False if you want to require it at create-time
        blank=True,
        related_name='users'
    )
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        super().clean()
        # if you make campus required, you can drop the null/blank guards here
        if self.email and self.campus:
            expected = f"@{self.campus.email_domain}"
            if not self.email.lower().endswith(expected.lower()):
                raise ValidationError("Email must match your campus domain.")
        

class Campus(models.Model):
    name = models.CharField(max_length=100, unique=True)
    email_domain = models.CharField(max_length=50, unique=True)  # e.g. "ttu.edu"

    def average_ratings(self):
        return Review.objects.filter(
            apartment__campus=self
        ).aggregate(
            avg_cost=models.Avg('cost'),
            avg_safety=models.Avg('safety'),
            avg_management=models.Avg('management'),
            avg_noise=models.Avg('noise')
        )



class Apartment(models.Model):
    campus = models.ForeignKey('Campus', on_delete=models.CASCADE, related_name='apartments')
    name = models.CharField(max_length=200)
    addressline1 = models.CharField(max_length=300)
    addressline2 = models.CharField(max_length=300,null=True, blank=True)
    county = models.CharField(max_length=300)
    state = models.CharField(max_length=2, choices=US_STATE_CHOICES)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        unique_together = ('campus', 'name')


    def average_rating(self):
        return self.reviews.aggregate(
            avg_cost=models.Avg('cost'),
            avg_safety=models.Avg('safety'),
            avg_management=models.Avg('management'),
            avg_noise=models.Avg('noise')

        )


class Review(models.Model):
    RATING_CHOICES = [(i, i) for i in range(1, 6)]
    apartment = models.ForeignKey('Apartment', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reviews')
    cost = models.IntegerField(choices=RATING_CHOICES)
    safety = models.IntegerField(choices=RATING_CHOICES)
    management = models.IntegerField(choices=RATING_CHOICES)
    noise = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tag1 = models.CharField(max_length=30, choices=APARTMENT_TAG_CHOICES)
    tag2 = models.CharField(max_length=30, choices=APARTMENT_TAG_CHOICES)
    tag3 = models.CharField(max_length=30, choices=APARTMENT_TAG_CHOICES)

    class Meta:
        unique_together = ('apartment', 'user')

    def clean(self):
        for field in ('cost', 'safety', 'management', 'noise'):
            value = getattr(self, field)
            if not (1 <= value <= 5):
                raise ValidationError(f"{field} rating must be between 1 and 5.")

class Media(models.Model):
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='media')
    image = models.FileField(upload_to='review_media/')


class Bookmark(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='bookmarks')
    apartment = models.ForeignKey('Apartment', on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'apartment')


class Report(models.Model):
    STATUS = [('pending', 'Pending'), ('resolved', 'Resolved'), ('rejected', 'Rejected')]
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey('User', on_delete=models.CASCADE, related_name='reports_made')
    reason = models.CharField(max_length=200)
    status = models.CharField(max_length=8, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('review', 'reporter')
"""
@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    if created and not instance.is_verified:
        pass
        instance.send_verification_email()
"""