from modeltranslation.translator import register, TranslationOptions
from django.db.models.fields.files import ImageFieldFile, FileField
from .models import Card, Image


@register(Card)
class CardTranslationOptions(TranslationOptions):
    fields = ('development', 'hint', 'is_certified', 'know_more', 'lead', 'text',
              'title', 'you_will_need', 'is_public')


@register(Image)
class ImageTranslationOptions(TranslationOptions):
    fields = ('image', 'description')
