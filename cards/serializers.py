# -*- coding: utf-8 -*-
from __future__ import print_function
from rest_framework import serializers
from .models import Authors, Audience, Axis, Card, Like, YoutubeEmbed, Image
from drf_writable_nested import WritableNestedModelSerializer

from accounts.serializers import TimtecUserSerializer


class BaseUserSerializer(TimtecUserSerializer):
    pass


class AudienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = '__all__'


class AxisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Axis
        fields = '__all__'


class AuthorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Authors
        fields = '__all__'


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('pk', 'image', 'description')


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('pk', 'user', 'card', 'created')


class YoutubeEmbedSerializer(serializers.ModelSerializer):

    url = serializers.CharField()

    class Meta:
        model = YoutubeEmbed
        fields =('pk', 'url')


class CardSerializer(serializers.ModelSerializer):

    audience = serializers.SerializerMethodField()
    author = BaseUserSerializer(required=False, read_only=True)
    authors = serializers.SerializerMethodField('get_several_authors')
    # authors = AuthorsSerializer(many=True, required=False)
    axis = serializers.SerializerMethodField()
    image_gallery = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    # youtube_embeds = YoutubeEmbedSerializer(many=True, required=False)
    youtube_embeds = serializers.SerializerMethodField()

    def get_axis(self, obj):
        return AxisSerializer(instance=obj.axis, **{'context': self.context}).data

    def get_audience(self, obj):
        return AudienceSerializer(instance=obj.audience, **{'context': self.context}).data

    def get_several_authors(self, obj):
        return AuthorsSerializer(instance=obj.authors, many=True, **{'context': self.context}).data

    def get_image_gallery(self, obj):
        return ImageSerializer(instance=obj.image_gallery, many=True, **{'context': self.context}).data

    def get_likes(self, obj):
        return obj.like_set.count()

    def get_tags(self, obj):
        return TagsInCardsSerializer(instance=obj.tags, many=True, **{'context': self.context}).data

    def get_youtube_embeds(self, obj):
        return YoutubeEmbedSerializer(instance=obj.youtube_embeds, many=True, **{'context': self.context}).data

    class Meta:
        model = Card
        fields = ('pk',
                  'audience',
                  'author',
                  'authors',
                  'axis',
                  'development',
                  'hint',
                  'image_gallery',
                  'is_certified',
                  'know_more',
                  'likes',
                  'tags',
                  'text',
                  'title',
                  'youtube_embeds',
                  'you_will_need')

    def create(self, validated_data):
        card = Card.objects.create(**validated_data)

        if 'axis' in self.initial_data.keys():
            axis = self.initial_data.pop('axis')
            card.axis = Axis.objects.get(id=axis['id'])

        if 'audience' in self.initial_data.keys():
            audience = self.initial_data.pop('audience')
            card.audience = Audience.objects.get(id=audience['id'])

        if 'authors' in self.initial_data.keys():
            authors = self.initial_data.pop('authors')
            for dude in authors:
                card.authors.add(Authors.get(id=dude['id']))

        if 'image_gallery' in self.initial_data.keys():
            image_gallery = self.initial_data.pop('image_gallery')
            for image in image_gallery:
                card.image_gallery.add(Image.objects.get(id=image['id']))

        if 'tags' in self.initial_data.keys():
            tags = self.initial_data.pop('tags')
            card.tags.add(*tags)

        if 'youtube_embeds' in self.initial_data.keys():
            youtube_embeds = self.initial_data.pop('youtube_embeds')
            for embed in youtube_embeds:
                card.youtube_embeds.add(YoutubeEmbed.objects.get(id=embed['id']))

        return card

    def update(self, instance, validated_data):
        from pprint import pprint
        pprint(instance)
        # Content fields
        instance.development = self.validated_data.get('development', '')
        instance.hint = self.validated_data.get('hint', '')
        instance.is_certified = self.validated_data.get('is_certified', '')
        instance.know_more = self.validated_data.get('know_more', '')
        instance.text = self.validated_data.get('text', '')
        instance.title = self.validated_data.get('title', '')
        instance.you_will_need = self.validated_data.get('you_will_need', '')

        # Clean current fields and repopulate if they need to be changed
        if instance.axis:
            instance.axis.clear()
        if 'axis' in self.validated_data.keys():
            axis = self.validated_data.pop('axis')
            instance.axis = Axis.objects.get(id=axis['id'])

        if instance.audience:
            instance.audience.clear()
        if 'audience' in self.validated_data.keys():
            audience = self.validated_data.pop('audience')
            instance.audience = Audience.objects.get(id=audience['id'])

        if instance.authors:
            instance.authors.clear()
        if 'authors' in self.validated_data.keys():
            authors = self.validated_data.pop('authors')
            for dude in authors:
                instance.authors.add(Authors.objects.get(id=authors['id']))

        if instance.image_gallery:
            instance.image_gallery.clear()
        if 'image_gallery' in self.validated_data.keys():
            image_gallery = self.validated_data.pop('image_gallery')
            for image in image_gallery:
                instance.image_gallery.add(Image.objects.get(id=image['id']))

        instance.tags.clear()
        if 'tags' in self.validated_data.keys():
            tags = self.validated_data.pop('tags')
            instance.tags.add(*tags)

        if instance.youtube_embeds:
            instance.youtube_embeds.clear()
        if 'youtube_embeds' in self.validated_data.keys():
            youtube_embeds = self.validated_data.pop('youtube_embeds')
            for embed in youtube_embeds:
                instance.youtube_embeds.add(YoutubeEmbed.objects.get(id=embed['id']))

        instance.save()
        return instance



class TagsInCardsSerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()
