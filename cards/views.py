from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from .models import Audience, Axis, Card, Image, Like, YoutubeEmbed
from .serializers import AudienceSerializer, AxisSerializer, CardSerializer, LikeSerializer, ImageGallerySerializer, YoutubeEmbedSerializer

class AudienceViewSet(viewsets.ReadOnlyModelViewSet):
    model = Audience
    queryset = Audience.objects.all()
    serializer_class = AudienceSerializer

class AxisViewSet(viewsets.ReadOnlyModelViewSet):
    model = Axis
    queryset = Axis.objects.all()
    serializer_class = AxisSerializer

class CardViewSet(viewsets.ModelViewSet):

    model = Card
    serializer_class = CardSerializer

    filter_backends = ( filters.DjangoFilterBackend, filters.SearchFilter)
    filter_fields = ('audience__name', 'axis__name', 'is_certified', 'tags__name')
    search_fields = (
                     'development',
                     'hint',
                     'know_more',
                     'text',
                     'title',
                     'you_will_need')


    def get_queryset(self):
        # Certified cards are available for everyone
        # queryset = Card.objects.filter(is_certified=True)
        queryset = Card.objects.all()
        # NON certified cards are only available for users in the same Contract
        # sooo....
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
