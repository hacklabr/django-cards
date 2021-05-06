from modeltranslation.translator import register, TranslationOptions
from django.db.models.fields.files import ImageFieldFile, FileField
from .models import Card, Image, Audience, Axis, CardFile, YoutubeEmbed


@register(Card)
class CardTranslationOptions(TranslationOptions):
    fields = ('development', 'hint', 'is_certified', 'know_more', 'lead', 'text',
              'title', 'you_will_need', 'is_public')


@register(Image)
class ImageTranslationOptions(TranslationOptions):
    fields = ('image', 'description')


@register(CardFile)
class CardFileTranslationOptions(TranslationOptions):
    fields = ('name', 'file')


@register(Audience)
class AudienceTranslationOptions(TranslationOptions):
    fields = ('name', 'description')


@register(Axis)
class AxisTranslationOptions(TranslationOptions):
    fields = ('name', 'description')


@register(YoutubeEmbed)
class YoutubeEmbedTranslationOptions(TranslationOptions):
    fields = ('video_id',)
