from django.shortcuts import get_object_or_404
from django.shortcuts import render
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from .models import User
from rest_framework import generics, filters
from rest_framework.permissions import *
from .serializers import *
from rest_framework_simplejwt.views import *
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count

# Create your views here.


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserNestedSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class CampusListView(generics.ListAPIView):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    search_fields = ['name', 'email_domain']
    permission_classes = [AllowAny]
    pagination_class = None  # disable pagination

class CampusDetailView(generics.RetrieveAPIView):
    queryset = Campus.objects.annotate(
        housing_count=Count('housings', distinct=True),
        review_count=Count('housings__reviews', distinct=True),
        avg_cost=Avg('housings__reviews__cost'),
        avg_safety=Avg('housings__reviews__safety'),
        avg_management=Avg('housings__reviews__management'),
        avg_noise=Avg('housings__reviews__noise'),
    )
    serializer_class = CampusSerializer
    permission_classes = [AllowAny]

class HousingListView(generics.ListAPIView):
    """
    fetch(`/api/apartments/?campus=${id}&search=${term}&ordering=-created_at`)
    """
    queryset = Housing.objects.select_related('campus').annotate(
        avg_cost=Avg('reviews__cost'),
        avg_safety=Avg('reviews__safety'),
        avg_management=Avg('reviews__management'),
        avg_noise=Avg('reviews__noise'),
        review_count=Count('reviews')
    )
    serializer_class = HousingSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campus','type']
    search_fields = ['name', 'addressline1', 'addressline2', 'county']
    ordering_fields = ['name', 'latitude', 'longitude']

class HousingDetailView(generics.RetrieveAPIView):
    queryset = Housing.objects.select_related('campus').annotate(
        avg_cost       = Avg('reviews__cost'),
        avg_safety     = Avg('reviews__safety'),
        avg_management = Avg('reviews__management'),
        avg_noise      = Avg('reviews__noise'),
        review_count   = Count('reviews')
    )
    serializer_class = HousingSerializer
    permission_classes = [AllowAny]

class HousingReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        # stash the apartment object so our serializer.create() can use it
        ctx['housing'] = get_object_or_404(Housing, pk=self.kwargs['housing_pk'])
        return ctx
    

    def get_queryset(self):
        house = get_object_or_404(Housing, pk=self.kwargs['housing_pk'])
        return house.reviews.select_related('user').all()

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]
    
class UserReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('housing').order_by('-created_at')
    

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.select_related('user', 'housing').all()
    serializer_class = ReviewSerializer

    def get_permissions(self):
        # Anyone can GET, only auth’d users can update/delete
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You can only edit your own reviews.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own reviews.")
        instance.delete()

class BookmarkListCreateView(generics.ListCreateAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)



class BookmarkDeleteView(generics.DestroyAPIView):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only remove your own bookmarks.")
        instance.delete()




class MediaUploadView(generics.CreateAPIView):
    serializer_class  = MediaSerializer
    parser_classes     = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['review'] = get_object_or_404(Review, pk=self.kwargs['review_pk'])
        return ctx

    def perform_create(self, serializer):
        review = self.get_serializer_context()['review']
        if review.user != self.request.user:
            raise PermissionDenied("You can only upload media to your own reviews.")
        # now delegate to serializer.create(), which will pull 'review' from context
        serializer.save()

    def get_queryset(self):
        review = self.get_serializer_context()['review']
        return review.media.all()

class MediaDetailView(generics.RetrieveDestroyAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get_object(self):
        media = super().get_object()
        if media.review.user != self.request.user:
            raise PermissionDenied("You can only delete media from your own reviews.")
        return media

class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class ReportListView(generics.ListAPIView):
    queryset = Report.objects.select_related('review', 'reporter').all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

class ReportStatusUpdateView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportStatusUpdateSerializer
    permission_classes = [IsAdminUser]