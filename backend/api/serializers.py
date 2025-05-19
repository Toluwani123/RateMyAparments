# serializers.py
from .models import *
from .listforstates import *
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email']    = user.email
        return token
class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

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
    apt_count = serializers.IntegerField(read_only=True)
    review_count = serializers.IntegerField(read_only=True) 
    avg_cost = serializers.FloatField(read_only=True)
    avg_safety = serializers.FloatField(read_only=True)
    avg_management = serializers.FloatField(read_only=True)
    avg_noise = serializers.FloatField(read_only=True)
   
    class Meta:
        model = Campus
        fields = ('id', 'name', 'email_domain','apt_count', 'review_count',
                  'avg_cost', 'avg_safety', 'avg_management', 'avg_noise')

class ApartmentSerializer(serializers.ModelSerializer):
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Campus.objects.all(), source='campus'
    )

    avg_cost = serializers.FloatField(read_only=True)
    avg_safety = serializers.FloatField(read_only=True)
    avg_management = serializers.FloatField(read_only=True)
    avg_noise = serializers.FloatField(read_only=True)

    class Meta:
        model = Apartment
        fields = (
            'id', 'campus', 'campus_id',
            'name', 'addressline1', 'addressline2',
            'county', 'state', 'latitude', 'longitude', 'avg_cost',
            'avg_safety', 'avg_management', 'avg_noise',
        )

class ReviewSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    apartment = serializers.PrimaryKeyRelatedField(read_only=True)
    tag1 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    tag2 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    tag3 = serializers.ChoiceField(choices=APARTMENT_TAG_CHOICES)
    media_urls = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'apartment', 'user',
            'cost', 'safety', 'management', 'noise',
            'comment', 'tag1', 'tag2', 'tag3',
            'created_at', 'updated_at',
            'media_urls',
        )
        read_only_fields = (
            'id', 'apartment', 'user',
            'created_at', 'updated_at', 'media_urls'
        )

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
        validated_data.pop('apartment', None)

        apartment = self.context['apartment']
        user      = self.context['request'].user
        return Review.objects.create(
            apartment=apartment,
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
    apartment = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all())

    class Meta:
        model = Bookmark
        fields = ('id', 'user', 'apartment', 'created_at')
        read_only_fields = ('id','user','created_at')
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