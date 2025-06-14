
US_STATE_CHOICES = [
    ('AL', 'Alabama'),
    ('AK', 'Alaska'),
    ('AZ', 'Arizona'),
    ('AR', 'Arkansas'),
    ('CA', 'California'),
    ('CO', 'Colorado'),
    ('CT', 'Connecticut'),
    ('DE', 'Delaware'),
    ('FL', 'Florida'),
    ('GA', 'Georgia'),
    ('HI', 'Hawaii'),
    ('ID', 'Idaho'),
    ('IL', 'Illinois'),
    ('IN', 'Indiana'),
    ('IA', 'Iowa'),
    ('KS', 'Kansas'),
    ('KY', 'Kentucky'),
    ('LA', 'Louisiana'),
    ('ME', 'Maine'),
    ('MD', 'Maryland'),
    ('MA', 'Massachusetts'),
    ('MI', 'Michigan'),
    ('MN', 'Minnesota'),
    ('MS', 'Mississippi'),
    ('MO', 'Missouri'),
    ('MT', 'Montana'),
    ('NE', 'Nebraska'),
    ('NV', 'Nevada'),
    ('NH', 'New Hampshire'),
    ('NJ', 'New Jersey'),
    ('NM', 'New Mexico'),
    ('NY', 'New York'),
    ('NC', 'North Carolina'),
    ('ND', 'North Dakota'),
    ('OH', 'Ohio'),
    ('OK', 'Oklahoma'),
    ('OR', 'Oregon'),
    ('PA', 'Pennsylvania'),
    ('RI', 'Rhode Island'),
    ('SC', 'South Carolina'),
    ('SD', 'South Dakota'),
    ('TN', 'Tennessee'),
    ('TX', 'Texas'),
    ('UT', 'Utah'),
    ('VT', 'Vermont'),
    ('VA', 'Virginia'),
    ('WA', 'Washington'),
    ('WV', 'West Virginia'),
    ('WI', 'Wisconsin'),
    ('WY', 'Wyoming'),
]

APARTMENT_TAG_CHOICES = [
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
]


def compatibility_score(user1, user2, *, w_bookmarks=0.6, w_prefs=0.4):
    from .models import RoommateProfile
    b1 = set(user1.bookmarks.values_list('housing_id', flat=True))
    b2 = set(user2.bookmarks.values_list('housing_id', flat=True))

    if not b1 or not b2:
        jaccard = 0.0
    else:
        intersection = b1&b2
        union = b1|b2
        jaccard = len(intersection) / len(union)

    try:
        p1 = user1.roommate_profile
        p2 = user2.roommate_profile
    except RoommateProfile.DoesNotExist:
        pref_score = 0.0

    else:

        def numeric_sim(a,b):
            if a is None or b is None:
                return 0.5
            diff = abs(a - b)
            return 1-(diff / 4)
        

        cleanliness_sim = numeric_sim(p1.cleanliness, p2.cleanliness)
        noise_sim = numeric_sim(p1.noise_tolerance, p2.noise_tolerance)

        pets_sim = 1.0 if p1.pets_ok == p2.pets_ok else 0.0
        smoke_sim = 1.0 if p1.smoker_ok == p2.smoker_ok else 0.0
        sleep_sim = 1.0 if p1.sleep_schedule == p2.sleep_schedule else 0.0

        summary = [cleanliness_sim, noise_sim, pets_sim, smoke_sim, sleep_sim]

        pref_score = sum(summary) / len(summary)

    return w_bookmarks * jaccard + w_prefs * pref_score
