from django.urls import path
from .views import *

urlpatterns = [
    path('campuses/', CampusListView.as_view()),
    path('campuses/<int:pk>/', CampusDetailView.as_view()),
    path('apartments/', ApartmentListView.as_view()),
    path('apartments/<int:pk>/', ApartmentDetailView.as_view()),
    path('apartments/<int:apartment_pk>/reviews/',ApartmentReviewListCreateView.as_view()),
    path('reviews/<int:pk>/', ReviewDetailView.as_view()),
    path('reviews/<int:review_pk>/media/',MediaUploadView.as_view()),
    path('users/me/bookmarks/',BookmarkListCreateView.as_view()),
    path('bookmarks/<int:pk>/',BookmarkDeleteView.as_view()),
    path('reviews/<int:review_pk>/reports/',ReportCreateView.as_view()),
    path('reports/',ReportListView.as_view()),
    path('reports/<int:pk>/',ReportStatusUpdateView.as_view()),
    
]
