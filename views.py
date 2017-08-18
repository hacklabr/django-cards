from django.shortcuts import render
from rest_framework import viewsets
from .models import Card, Image, Like, YoutubeEmbed
from .serializers import CardSerializer, LikeSerializer, ImageGallerySerializer, YoutubeEmbedSerializer

# Create your views here.

class CardViewSet(viewsets.ModelViewSet):

    model = Card
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    # filter_fields = ('audience',
    #                  'axis',
                     # 'development',
                     # 'hint',
                     # 'is_certified',
                     # 'know_more',
                     # 'tags',
                     # 'text',
                     # 'title',
                     # 'you_will_need')
    # filter_backends = (filters.DjangoFilterBackend, )

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