# -*- coding: utf-8 -*-
from __future__ import print_function
from django.conf import settings
from rest_framework import filters
from rest_framework import serializers
from .models import Authors, Card, Like, YoutubeEmbed, Image
from drf_writable_nested import WritableNestedModelSerializer
import sys
from pprint import pprint

class AuthorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Authors
        fields = ('pk', 'author_name', 'author_description')


class ImageGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('pk', 'image', 'description')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('pk', 'user', 'card', 'created')

class YoutubeEmbedSerializer(serializers.ModelSerializer):

    url = serializers.CharField()
    # card = CardSerializer()

    class Meta:
        model = YoutubeEmbed
        fields =('pk', 'url')

class CardSerializer(WritableNestedModelSerializer):

    authors = AuthorsSerializer(many=True, allow_null=True)

    image_gallery = ImageGallerySerializer(many=True, allow_null=True)

    youtube_embeds = YoutubeEmbedSerializer(many=True, allow_null=True)

    class Meta:
        model = Card
        fields = ('pk',
                  'audience',
                  'author',
                  'authors',
                  'development',
                  'hint',
                  'image_gallery',
                  'is_certified',
                  'know_more',
                  'text',
                  'title',
                  'youtube_embeds',
                  'you_will_need')