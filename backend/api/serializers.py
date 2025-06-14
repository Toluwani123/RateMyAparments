# serializers.py
from .models import *
from .listforstates import *
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from collections import Counter


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email']    = user.email
        return token
class UserNestedSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source='campus.name', read_only=True)
    class Meta:
        model = User
        fields = ('id','username','email','campus','campus_name','is_verified','date_joined')


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password  = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        # just add first_name/last_name here
        fields = (
            'username', 'email',
            'first_name', 'last_name',
            'password', 'password2',
            'campus',
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        if not attrs['email'].lower().endswith('.edu'):
            raise serializers.ValidationError({"email": "Must be an .edu address."})
        return attrs

    def create(self, validated):
        # pop the extras
        validated.pop('password2')
        pwd = validated.pop('password')

        # DRF’s ModelSerializer will have put 'first_name', 'last_name', 'campus' in validated
        user = User.objects.create_user(
            username=validated['username'],
            email=validated['email'],
            password=pwd,
            campus=validated.get('campus'),
            first_name=validated.get('first_name', ''),
            last_name=validated.get('last_name', ''),
        )
        return user

class CampusSerializer(serializers.ModelSerializer):
    housing_count = serializers.IntegerField(read_only=True)
    review_count = serializers.IntegerField(read_only=True) 
    avg_cost = serializers.FloatField(read_only=True)
    avg_safety = serializers.FloatField(read_only=True)
    avg_management = serializers.FloatField(read_only=True)
    avg_noise = serializers.FloatField(read_only=True)
   
    class Meta:
        model = Campus
        fields = ('id', 'name', 'email_domain','housing_count', 'review_count',
                  'avg_cost', 'avg_safety', 'avg_management', 'avg_noise')

class HousingSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Campus.objects.all(), source='campus'
    )
    type = serializers.ChoiceField(choices=Housing.TYPE_CHOICES)
    is_bookmarked = serializers.SerializerMethodField(read_only=True)
    bookmark_id = serializers.SerializerMethodField(read_only=True)
    avg_cost = serializers.FloatField(read_only=True)
    avg_safety = serializers.FloatField(read_only=True)
    avg_management = serializers.FloatField(read_only=True)
    avg_noise = serializers.FloatField(read_only=True)
    review_count   = serializers.IntegerField(read_only=True)
    top_tags = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Housing
        fields = (
            'id', 'campus', 'campus_id', 'type',
            'name', 'addressline1', 'addressline2',
            'county', 'state', 'latitude', 'longitude', 'avg_cost',
            'avg_safety', 'avg_management', 'avg_noise', 'review_count', 'top_tags', 'is_bookmarked', 'bookmark_id'
        )

    def get_top_tags(self, housing):
        tag_counts = Counter()
        for review in housing.reviews.all():
            tag_counts.update([review.get_tag1_display(), review.get_tag2_display(), review.get_tag3_display()])

        return [tag for tag,_ in tag_counts.most_common(3)]
    
    def get_is_bookmarked(self, housing):
        user = self.context['request'].user
        if not user.is_authenticated:
            return False
        return Bookmark.objects.filter(user=user, housing=housing).exists()
    def get_bookmark_id(self, housing):
        user = self.context['request'].user
        if not user.is_authenticated:
            return None
        bookmark = Bookmark.objects.filter(user=user, housing=housing).first()
        return bookmark.id if bookmark else None

class ReviewSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    housing = serializers.PrimaryKeyRelatedField(read_only=True)
    housing_name = serializers.CharField(source='housing.name', read_only=True)
    housing_type = serializers.CharField(source='housing.type', read_only=True)
    tag1 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    tag2 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    tag3 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    tag1_display = serializers.CharField(source='get_tag1_display', read_only=True)
    tag2_display = serializers.CharField(source='get_tag2_display', read_only=True)
    tag3_display = serializers.CharField(source='get_tag3_display', read_only=True)
    media_urls = serializers.SerializerMethodField()
    media_items = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'housing', 'user',
            'cost', 'safety', 'management', 'noise',
            'comment', 'tag1', 'tag2', 'tag3',
            'created_at', 'updated_at',
            'media_urls', 'tag1_display', 'tag2_display', 'tag3_display', 'housing_name', 'housing_type', 'media_items',
        )
        read_only_fields = (
            'id', 'housing', 'user',
            'created_at', 'updated_at', 'media_urls', 'housing_name', 'housing_type',
        )

    def get_media_items(self, review):
        request = self.context.get('request')
        return [
            {
                'id': m.id,
                'url': request.build_absolute_uri(m.image.url)
            }
            for m in review.media.all()
        ]

    def get_media_urls(self, review):
        request = self.context.get('request')
        urls = []
        for m in review.media.all():
            url = m.image.url
            if request:
                url = request.build_absolute_uri(url)
            urls.append(url)
        return urls

    def create(self, validated_data):
        validated_data.pop('user', None)
        validated_data.pop('housing', None)

        housing = self.context['housing']
        user      = self.context['request'].user
        return Review.objects.create(
            housing=housing,
            user=user,
            **validated_data
        )

class MediaSerializer(serializers.ModelSerializer):
    review = serializers.PrimaryKeyRelatedField(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ('id', 'review', 'image', 'file_url')
        read_only_fields = ('id', 'review', 'file_url')

    def get_file_url(self, obj):
        request = self.context.get('request')
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

    def create(self, validated_data, **kwargs):
        # pick up review from either save() kwargs or serializer_context
        review = kwargs.pop('review', None) or self.context.get('review')
        return Media.objects.create(review=review, **validated_data)
    
    
class BookmarkSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    housing = serializers.PrimaryKeyRelatedField(queryset=Housing.objects.all())
    housing_name = serializers.CharField(source='housing.name', read_only=True)

    class Meta:
        model = Bookmark
        fields = ('id', 'user', 'housing', 'created_at', 'housing_name')
        read_only_fields = ('id','user','created_at', 'housing_name')
    def create(self, validated):
        return Bookmark.objects.create(user=self.context['request'].user, **validated)

class ReportSerializer(serializers.ModelSerializer):
    reporter = UserNestedSerializer(read_only=True)
    review = serializers.PrimaryKeyRelatedField(queryset=Review.objects.all())

    class Meta:
        model = Report
        fields = ('id', 'review', 'reporter', 'reason', 'status', 'created_at')
        read_only_fields = ('id','reporter','status','created_at')
    def create(self, validated):
        return Report.objects.create(reporter=self.context['request'].user, **validated)

#
# Admin/Moderator can update report status
#
class ReportStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('status',)


class RoommateMatchSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Campus.objects.all(), source='campus' )
    
    user = UserNestedSerializer(read_only=True)
    score = serializers.FloatField(read_only=True)

    class Meta:
        model = RoommateProfile
        fields = (
            'id', 'user', 'campus', 'campus_id',
            'cleanliness', 'noise_tolerance',
            'pets_ok', 'smoker_ok', 'sleep_schedule',
            'bio', 'score',
        )