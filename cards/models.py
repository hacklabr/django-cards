# -*- coding: utf-8 -*-
from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _
# from tagulous.models import TagField
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
    audience = models.ForeignKey('Audience', blank=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, verbose_name=_('Author'), blank=True, null=True)
    axis = models.OneToOneField('Axis', blank=True, null=True)
    development = models.TextField(verbose_name=_('Development'), blank=True)
    hint = models.TextField(verbose_name=_('Hints'), blank=True)
    is_certified = models.BooleanField(verbose_name=_('Card was certified'), default=False)
    know_more = models.TextField(verbose_name=_('Know More About'), blank=True)
    # tags = TagField(blank=True, null=True, force_lowercase=True, initial="eating, coding, gaming")
    tags = TaggableManager(blank=True)
    text = models.TextField(verbose_name=_('Text'), blank=True)
    title = models.CharField(verbose_name=_('Title'), max_length=255)
    you_will_need = models.TextField(verbose_name=_('Requirements for this'), blank=True)

    def __unicode__(self):
        return u'%s - %s' % (self.title, self.audience)

# class CardAdminGroups(models.Model):


class Image(models.Model):
    '''
    I really really think this is a bad name. Oh well.
    '''
    image = models.ImageField()
    description = models.TextField(_('Description'), blank=True)
    card = models.ForeignKey('Card', related_name='image_gallery', on_delete=models.SET_NULL, blank=True, null=True)

class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    card = models.ForeignKey(Card)
    created = models.DateTimeField(auto_now_add=True)

class YoutubeEmbed(models.Model):
    url = models.URLField(max_length=255)
    card = models.ForeignKey('Card', related_name='youtube_embeds', on_delete=models.SET_NULL, blank=True, null=True)


