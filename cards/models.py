# -*- coding: utf-8 -*-
from django.conf import settings
from django.db import models
from django.contrib.auth.models import Group
from django.utils.translation import ugettext_lazy as _
from taggit.managers import TaggableManager
from taggit.models import TaggedItemBase


class Audience(models.Model):
    '''
    This is not a public-private modifier. It just represents which type of
    audience the card is intended to
    '''
    name = models.CharField(_('Name'), max_length=255)
    description = models.TextField(_('Description'), blank=True)

    def __str__(self):
        return u'%s' % (self.name)


class Authors(models.Model):
    author_name = models.CharField(_('Author Name'), max_length=255)
    author_description = models.TextField(_('Author Description'), blank=True)
    card = models.ForeignKey('Card', related_name='authors', on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        if self.card:
            title = self.card.title
        else:
            title = None
        return u'{} - {}'.format(self.author_name, title)


class Axis(models.Model):
    '''
    This is a type of category that can be changed on admin interface.

    It is NOT a reminder for World War II nation states.
    '''
    name = models.CharField(_('Name'), max_length=255)
    description = models.TextField(_('Description'), blank=True)

    def __str__(self):
        return u'%s' % (self.name)


class CardTag(TaggedItemBase):
    content_object = models.ForeignKey('Card', on_delete=models.CASCADE)


class Card(models.Model):
    audience = models.ForeignKey('Audience', on_delete=models.SET_NULL, blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('Author'), on_delete=models.SET_NULL, blank=True, null=True)
    axis = models.ForeignKey('Axis', on_delete=models.SET_NULL, blank=True, null=True)
    development = models.TextField(verbose_name=_('Development'), blank=True)
    hint = models.TextField(verbose_name=_('Hints'), blank=True)
    is_certified = models.BooleanField(verbose_name=_('Card was certified'), default=False)
    know_more = models.TextField(verbose_name=_('Know More About'), blank=True)
    lead = models.CharField(verbose_name=_('Lead'), blank=True, max_length=255)
    tags = TaggableManager(blank=True, through=CardTag)
    text = models.TextField(verbose_name=_('Text'), blank=True)
    title = models.CharField(verbose_name=_('Title'), max_length=255)
    you_will_need = models.TextField(verbose_name=_('Requirements for this'), blank=True)
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('Groups'),
        related_name='cards',
        blank=True,
    )
    is_public = models.BooleanField(
        _('Public'),
        default=False,
    )

    def __str__(self):
        return u'%s' % (self.title)

    class Meta:
        ordering = ['-id']


class Image(models.Model):
    '''
    I really really think this is a bad name. Oh well.
    '''
    image = models.ImageField(upload_to='cards_images/')
    description = models.TextField(_('Description'), blank=True)
    card = models.ForeignKey('Card', related_name='image_gallery', on_delete=models.SET_NULL, blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_('User'),
        on_delete=models.SET_NULL,
        related_name='cards_images',
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ['id']

    def __str__(self):
        return u'{} - Card {} - User {}'.format(self.image, self.card, self.user)


class CardFile(models.Model):
    name = models.CharField(_('Name'), max_length=255, null=True, blank=True)
    card = models.ForeignKey('Card', models.CASCADE, related_name='files', null=True, blank=True)
    file = models.FileField(upload_to='cards_files/')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=_('User'),
        on_delete=models.SET_NULL,
        related_name='cards_files',
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ['id']

    def __unicode__(self):
        return self.name

    def __str__(self):
        return u'{} - Card {} - User {}'.format(self.file, self.card, self.user)


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card = models.ForeignKey(Card, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)


class YoutubeEmbed(models.Model):
    video_id = models.CharField(max_length=255)
    card = models.ForeignKey('Card', related_name='youtube_embeds', on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ['id']
