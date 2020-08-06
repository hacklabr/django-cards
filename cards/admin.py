from django.contrib import admin
from .models import Audience, Authors, Axis, Card, Image, Like, YoutubeEmbed
# from tagulous.admin import register as tagulous_register

class AuthorsInline(admin.TabularInline):
    model = Authors

class ImageInline(admin.TabularInline):
    model = Image
    exclude = ('user',)

class YoutubeEmbedInline(admin.TabularInline):
    model = YoutubeEmbed

class CardAdmin(admin.ModelAdmin):
    inlines = [
        AuthorsInline,
        ImageInline,
        YoutubeEmbedInline
    ]
    autocomplete_fields = [
        'author',
        'groups',
    ]
    list_filter = [
        'groups',
        'is_public',
    ]

admin.site.register(Authors)
admin.site.register(Audience)
admin.site.register(Axis)
admin.site.register(Card, CardAdmin)
admin.site.register(Like)
admin.site.register(Image)