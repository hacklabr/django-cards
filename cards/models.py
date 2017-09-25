# -*- coding: utf-8 -*-
from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _
from taggit.managers import TaggableManager


class Audience(models.Model):
    '''
    This is not a public-private modifier. It just represents which type of
    audience the card is intended to
    '''
    name = models.CharField(_('Name'), max_length=255)
    description = models.TextField(_('Description'), blank=True)

    def __unicode__(self):
        return u'%s' % (self.name)


class Authors(models.Model):
    author_name = models.CharField(_('Author Name'), max_length=255)
    author_description = models.TextField(_('Author Description'), blank=True)
    card = models.ForeignKey('Card', related_name='authors', on_delete=models.SET_NULL, blank=True, null=True)

    def __unicode__(self):
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

    def __unicode__(self):
        return u'%s' % (self.name)


class Card(models.Model):
    audience = models.ForeignKey('Audience')  # , blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('Author'), blank=True, null=True)
    axis = models.ForeignKey('Axis')  # , blank=True, null=True)
    development = models.TextField(verbose_name=_('Development'), blank=True)
    hint = models.TextField(verbose_name=_('Hints'), blank=True)
    is_certified = models.BooleanField(verbose_name=_('Card was certified'), default=False)
    know_more = models.TextField(verbose_name=_('Know More About'), blank=True)
    lead = models.CharField(verbose_name=_('Lead'), blank=True, max_length=255)
    tags = TaggableManager(blank=True)
    text = models.TextField(verbose_name=_('Text'), blank=True)
    title = models.CharField(verbose_name=_('Title'), max_length=255)
    you_will_need = models.TextField(verbose_name=_('Requirements for this'), blank=True)

    def __unicode__(self):
        return u'%s' % (self.title)

    class Meta:
        ordering = ['-id']


class Image(models.Model):
    '''
    I really really think this is a bad name. Oh well.
    '''
    image = models.ImageField()
    description = models.TextField(_('Description'), blank=True)
    card = models.ForeignKey('Card', related_name='image_gallery', on_delete=models.SET_NULL, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('User'), blank=True, null=True)

    class Meta:
        ordering = ['id']

    def __unicode__(self):
        return u'{} - Card {} - User {}'.format(self.image, self.card, self.user)


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    card = models.ForeignKey(Card)
    created = models.DateTimeField(auto_now_add=True)


class YoutubeEmbed(models.Model):
    video_id = models.CharField(max_length=255)
    card = models.ForeignKey('Card', related_name='youtube_embeds', on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        ordering = ['id']
