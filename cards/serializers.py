from django.contrib.auth import get_user_model
from django.conf import settings

from rest_framework import serializers

from .models import Authors, Audience, Axis, Card, Like, YoutubeEmbed, Image, CardFile

from modeltranslation.utils import fallbacks


class BaseUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'image', 'name', 'email')


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

    user = BaseUserSerializer(read_only=True)

    class Meta:
        model = Image
        fields = ('id', 'image', 'description', 'user')


class CardFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CardFile
        fields = '__all__'


class LikeSerializer(serializers.ModelSerializer):

    user = BaseUserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ('id', 'user', 'card', 'created')

class LikeSerializerButOnlyId(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id',)


class YoutubeEmbedSerializer(serializers.ModelSerializer):

    video_id = serializers.CharField()

    class Meta:
        model = YoutubeEmbed
        fields =('id', 'video_id')


class CardSerializer(serializers.ModelSerializer):
    # TODO refactor this like there is no tomorow.

    audience = serializers.SerializerMethodField()
    author = BaseUserSerializer(read_only=True)
    authors = serializers.SerializerMethodField('get_several_authors')
    axis = serializers.SerializerMethodField()
    certifiable = serializers.SerializerMethodField()
    editable = serializers.SerializerMethodField()
    image_gallery = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    youtube_embeds = serializers.SerializerMethodField()

    def get_axis(self, obj):
        return AxisSerializer(instance=obj.axis, allow_null=True, required=False, **{'context': self.context}).data

    def get_audience(self, obj):
        return AudienceSerializer(instance=obj.audience, allow_null=True, required=False, **{'context': self.context}).data

    def get_certifiable(self, obj):
        user = self.context['request'].user
        if bool(set([g.name for g in user.groups.all()]) & set(settings.DJANGO_CARDS_ADMIN_GROUPS)):
            return True
        else:
            return False

    def get_editable(self, obj):
        # I'm defining some bool variables first
        user = self.context['request'].user
        user_is_in_admin_group = bool(set([g.name for g in user.groups.all()]) & set(settings.DJANGO_CARDS_ADMIN_GROUPS)) or \
                                 user.is_superuser

        if not obj.is_certified and obj.author == user:
            return True
        elif user_is_in_admin_group:
            return True

        return False

    def get_several_authors(self, obj):
        return AuthorsSerializer(instance=obj.authors,  allow_null=True, required=False, many=True, **{'context': self.context}).data

    def get_image_gallery(self, obj):
        with fallbacks(False):
            images = ImageSerializer(instance=obj.image_gallery,  allow_null=True, required=False, many=True, **{'context': self.context}).data
            images = [image for image in images if image['image'] != None]
            return images

    def get_files(self, obj):
        return CardFileSerializer(instance=obj.files,  allow_null=True, required=False, many=True, **{'context': self.context}).data

    def get_likes(self, obj):
        return obj.like_set.count()

    def get_tags(self, obj):
        return TagsInCardsSerializer(instance=obj.tags,  allow_null=True, required=False, many=True, **{'context': self.context}).data

    def get_user_liked(self, obj):
        like_object = obj.like_set.filter(user=self.context['request'].user).first()
        if like_object:
            return like_object.id
        else:
            return None

    def get_youtube_embeds(self, obj):
        return YoutubeEmbedSerializer(instance=obj.youtube_embeds,  allow_null=True, required=False, many=True, **{'context': self.context}).data

    class Meta:
        model = Card
        fields = ('id',
                  'audience',
                  'author',
                  'authors',
                  'axis',
                  'certifiable',
                  'development',
                  'editable',
                  'hint',
                  'image_gallery',
                  'files',
                  'is_certified',
                  'know_more',
                  'likes',
                  'lead',
                  'tags',
                  'text',
                  'title',
                  'user_liked',
                  'youtube_embeds',
                  'you_will_need',
                  'groups',
                  'is_public'
                  )

    def create(self, validated_data):

        if 'groups' in self.initial_data.keys():
            groups = validated_data.pop('groups')

        card = Card(**validated_data)
        card.save()
        #card.groups.add(*groups)

        if 'axis' in self.initial_data.keys():
            axis = self.initial_data.pop('axis')
            card.axis = Axis.objects.get(id=axis['id'])

        if 'audience' in self.initial_data.keys():
            audience = self.initial_data.pop('audience')
            card.audience = Audience.objects.get(id=audience['id'])
            # card.audience.save()
            # raise Exception('PARATUDO')

        # For dwelling with images (reverse foreign key), embeds (reverse foreign key) and tags (own package), we need
        # the card object to be instantiated
        card.save()
        if 'authors' in self.initial_data.keys():
            authors = self.initial_data.pop('authors')
            for dude in authors:
                name = dude['author_name'] if dude['author_name'] else ''
                description = dude['author_description'] if dude['author_description'] else ''
                Authors.objects.create(author_name=name,
                                    author_description=description,
                                    card=card)

        if 'image_gallery' in self.initial_data.keys():
            image_gallery = self.initial_data.pop('image_gallery')
            for image in image_gallery:
                card.image_gallery.add(Image.objects.get(id=image['id']))
                # Image.objects.get(id=image['id']).card = card

        if 'files' in self.initial_data.keys():
            files = self.initial_data.pop('files')
            for one_file in files:
                card.files.add(CardFile.objects.get(id=one_file['id']))

        if 'tags' in self.initial_data.keys():
            tags = self.initial_data.pop('tags')
            card.tags.add(*tags)

        if 'youtube_embeds' in self.initial_data.keys():
            youtube_embeds = self.initial_data.pop('youtube_embeds')
            for embed in youtube_embeds:
                card.youtube_embeds.add(YoutubeEmbed.objects.get(id=embed['id']))
                # YoutubeEmbed.objects.get(id=embed['id']).card = card
                # card.youtube_embeds.add()

        card.save()
        return card

    def update(self, instance, validated_data):

        # Content fields
        instance.development = self.initial_data.get('development', '')
        instance.hint = self.initial_data.get('hint', '')
        instance.is_certified = self.initial_data.get('is_certified', '')
        instance.know_more = self.initial_data.get('know_more', '')
        instance.lead = self.initial_data.get('lead', '')
        instance.text = self.initial_data.get('text', '')
        instance.title = self.initial_data.get('title', '')
        instance.you_will_need = self.initial_data.get('you_will_need', '')

        # Clean current fields and repopulate if they need to be changed
        if 'axis' in self.initial_data.keys():
            axis = self.initial_data.pop('axis')
            instance.axis = Axis.objects.get(id=axis['id'])

        if 'audience' in self.initial_data.keys():
            audience = self.initial_data['audience']
            instance.audience = Audience.objects.get(id=audience['id'])

        if 'authors' in self.initial_data.keys():
            if instance.authors.all():
                for autor in instance.authors.all():
                    autor.delete()
            authors = self.initial_data.pop('authors')
            for dude in authors:
                name = dude['author_name'] if dude['author_name'] else ''
                description = dude['author_description'] if dude['author_description'] else ''
                Authors.objects.create(author_name=name,
                                    author_description=description,
                                    card=instance
                                    )
                # instance.authors.add(Authors.objects.get(id=authors['id']))

        #if instance.image_gallery:
        #    instance.image_gallery.clear()
        if 'image_gallery' in self.initial_data.keys():
            image_gallery = self.initial_data.pop('image_gallery')
            for image in image_gallery:
                instance.image_gallery.add(Image.objects.get(id=image['id']))

        if instance.files:
            instance.files.clear()
        if 'files' in self.initial_data.keys():
            files = self.initial_data.pop('files')
            for one_file in files:
                instance.files.add(CardFile.objects.get(id=one_file['id']))

        instance.tags.clear()
        if 'tags' in self.initial_data.keys():
            tags = self.initial_data.pop('tags')
            instance.tags.add(*tags)

        if instance.youtube_embeds:
            instance.youtube_embeds.clear()
        if 'youtube_embeds' in self.initial_data.keys():
            youtube_embeds = self.initial_data.pop('youtube_embeds')
            for embed in youtube_embeds:
                instance.youtube_embeds.add(YoutubeEmbed.objects.get(id=embed['id']))

        instance.save()
        return instance


class TagsInCardsSerializer(serializers.Serializer):
    name = serializers.CharField()
    slug = serializers.CharField()
