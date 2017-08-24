from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from .models import Card, Image, Like, YoutubeEmbed
from .serializers import CardSerializer, LikeSerializer, ImageGallerySerializer, YoutubeEmbedSerializer
from pprint import pprint
# Create your views here.

class CardViewSet(viewsets.ModelViewSet):

    model = Card
    # queryset = self.get_queryset()
    serializer_class = CardSerializer
    permission_classes = (permissions.AllowAny,)

    filter_backends = ( filters.DjangoFilterBackend, filters.SearchFilter)
    filter_fields = ('axis__name', 'is_certified', 'tags__name')
    search_fields = (
                     # 'axis__name',
                     'development',
                     'hint',
                     # 'is_certified',
                     'know_more',
                     # 'tags__name',
                     'text',
                     'title',
                     'you_will_need')


    def get_queryset(self):
        print('\n\n\n\n\n\n')
        # pprint({contracts for self.request.user})
        print('\n\n\n\n\n\n\n')
        # Certified cards are available for everyone
        queryset = Card.objects.filter(is_certified=True)
        # NON certified cards are only available for users in the same Contract
        return queryset

class ImageGalleryViewSet(viewsets.ModelViewSet):

    model = Image
    queryset = Image.objects.all()
    serializer_class = ImageGallerySerializer

class LikeViewSet(viewsets.ModelViewSet):
    model = Like
    queryset = Like.objects.all()
    serializer_class = LikeSerializer

class YoutubeEmbedViewSet(viewsets.ModelViewSet):

    model = YoutubeEmbed
    queryset = YoutubeEmbed.objects.all()
    serializer_class = YoutubeEmbedSerializer


def cards_view(request):
    return render(request, 'cards.html', {})


def card_detail_view(request, *args, **kwargs):
    return render(request, 'card-detail.html', {})
