# Generated by Django 5.2.1 on 2025-05-16 19:32

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Campus",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
                ("email_domain", models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[
                            django.contrib.auth.validators.UnicodeUsernameValidator()
                        ],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, verbose_name="email address"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                ("is_verified", models.BooleanField(default=False)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
                (
                    "campus",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="users",
                        to="api.campus",
                    ),
                ),
            ],
            options={
                "verbose_name": "user",
                "verbose_name_plural": "users",
                "abstract": False,
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Apartment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("addressline1", models.CharField(max_length=300)),
                ("addressline2", models.CharField(max_length=300)),
                ("county", models.CharField(max_length=300)),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("AL", "Alabama"),
                            ("AK", "Alaska"),
                            ("AZ", "Arizona"),
                            ("AR", "Arkansas"),
                            ("CA", "California"),
                            ("CO", "Colorado"),
                            ("CT", "Connecticut"),
                            ("DE", "Delaware"),
                            ("FL", "Florida"),
                            ("GA", "Georgia"),
                            ("HI", "Hawaii"),
                            ("ID", "Idaho"),
                            ("IL", "Illinois"),
                            ("IN", "Indiana"),
                            ("IA", "Iowa"),
                            ("KS", "Kansas"),
                            ("KY", "Kentucky"),
                            ("LA", "Louisiana"),
                            ("ME", "Maine"),
                            ("MD", "Maryland"),
                            ("MA", "Massachusetts"),
                            ("MI", "Michigan"),
                            ("MN", "Minnesota"),
                            ("MS", "Mississippi"),
                            ("MO", "Missouri"),
                            ("MT", "Montana"),
                            ("NE", "Nebraska"),
                            ("NV", "Nevada"),
                            ("NH", "New Hampshire"),
                            ("NJ", "New Jersey"),
                            ("NM", "New Mexico"),
                            ("NY", "New York"),
                            ("NC", "North Carolina"),
                            ("ND", "North Dakota"),
                            ("OH", "Ohio"),
                            ("OK", "Oklahoma"),
                            ("OR", "Oregon"),
                            ("PA", "Pennsylvania"),
                            ("RI", "Rhode Island"),
                            ("SC", "South Carolina"),
                            ("SD", "South Dakota"),
                            ("TN", "Tennessee"),
                            ("TX", "Texas"),
                            ("UT", "Utah"),
                            ("VT", "Vermont"),
                            ("VA", "Virginia"),
                            ("WA", "Washington"),
                            ("WV", "West Virginia"),
                            ("WI", "Wisconsin"),
                            ("WY", "Wyoming"),
                        ],
                        max_length=2,
                    ),
                ),
                (
                    "latitude",
                    models.DecimalField(
                        blank=True, decimal_places=6, max_digits=9, null=True
                    ),
                ),
                (
                    "longitude",
                    models.DecimalField(
                        blank=True, decimal_places=6, max_digits=9, null=True
                    ),
                ),
                (
                    "campus",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="apartments",
                        to="api.campus",
                    ),
                ),
            ],
            options={
                "unique_together": {("campus", "name")},
            },
        ),
        migrations.CreateModel(
            name="Review",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "cost",
                    models.IntegerField(
                        choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
                    ),
                ),
                (
                    "safety",
                    models.IntegerField(
                        choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
                    ),
                ),
                (
                    "management",
                    models.IntegerField(
                        choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
                    ),
                ),
                (
                    "noise",
                    models.IntegerField(
                        choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
                    ),
                ),
                ("comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "tag1",
                    models.CharField(
                        choices=[
                            ("close_to_campus", "Close to Campus"),
                            ("responsive_maintenance", "Responsive Maintenance"),
                            ("affordable", "Affordable"),
                            ("thin_walls", "Thin Walls"),
                            ("party_atmosphere", "Party Atmosphere"),
                            ("secure_building", "Secure Building"),
                            ("noisy_neighbors", "Noisy Neighbors"),
                            ("all_inclusive_utilities", "All-Inclusive Utilities"),
                            ("helpful_office_staff", "Helpful Office Staff"),
                            ("modern_appliances", "Modern Appliances"),
                            ("walkable_area", "Walkable Area"),
                            ("unresponsive_management", "Unresponsive Management"),
                            ("quiet_and_chill", "Quiet & Chill"),
                            ("free_parking", "Free Parking"),
                            ("frequent_pest_issues", "Frequent Pest Issues"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "tag2",
                    models.CharField(
                        choices=[
                            ("close_to_campus", "Close to Campus"),
                            ("responsive_maintenance", "Responsive Maintenance"),
                            ("affordable", "Affordable"),
                            ("thin_walls", "Thin Walls"),
                            ("party_atmosphere", "Party Atmosphere"),
                            ("secure_building", "Secure Building"),
                            ("noisy_neighbors", "Noisy Neighbors"),
                            ("all_inclusive_utilities", "All-Inclusive Utilities"),
                            ("helpful_office_staff", "Helpful Office Staff"),
                            ("modern_appliances", "Modern Appliances"),
                            ("walkable_area", "Walkable Area"),
                            ("unresponsive_management", "Unresponsive Management"),
                            ("quiet_and_chill", "Quiet & Chill"),
                            ("free_parking", "Free Parking"),
                            ("frequent_pest_issues", "Frequent Pest Issues"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "tag3",
                    models.CharField(
                        choices=[
                            ("close_to_campus", "Close to Campus"),
                            ("responsive_maintenance", "Responsive Maintenance"),
                            ("affordable", "Affordable"),
                            ("thin_walls", "Thin Walls"),
                            ("party_atmosphere", "Party Atmosphere"),
                            ("secure_building", "Secure Building"),
                            ("noisy_neighbors", "Noisy Neighbors"),
                            ("all_inclusive_utilities", "All-Inclusive Utilities"),
                            ("helpful_office_staff", "Helpful Office Staff"),
                            ("modern_appliances", "Modern Appliances"),
                            ("walkable_area", "Walkable Area"),
                            ("unresponsive_management", "Unresponsive Management"),
                            ("quiet_and_chill", "Quiet & Chill"),
                            ("free_parking", "Free Parking"),
                            ("frequent_pest_issues", "Frequent Pest Issues"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "apartment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reviews",
                        to="api.apartment",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reviews",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("apartment", "user")},
            },
        ),
        migrations.CreateModel(
            name="Media",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("image", models.FileField(upload_to="review_media/")),
                (
                    "review",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="media",
                        to="api.review",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Bookmark",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "apartment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookmarked_by",
                        to="api.apartment",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bookmarks",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("user", "apartment")},
            },
        ),
        migrations.CreateModel(
            name="Report",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("reason", models.CharField(max_length=200)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("resolved", "Resolved"),
                            ("rejected", "Rejected"),
                        ],
                        default="pending",
                        max_length=8,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "reporter",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reports_made",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "review",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reports",
                        to="api.review",
                    ),
                ),
            ],
            options={
                "unique_together": {("review", "reporter")},
            },
        ),
    ]
