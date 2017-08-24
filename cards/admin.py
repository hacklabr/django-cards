from django.contrib import admin
from .models import Audience, Axis, Card, Image, Like, YoutubeEmbed
# from tagulous.admin import register as tagulous_register

class ImageInline(admin.TabularInline):
    model = Image

class YoutubeEmbedInline(admin.TabularInline):
    model = YoutubeEmbed

class CardAdmin(admin.ModelAdmin):
    inlines = [
        ImageInline,
        YoutubeEmbedInline
    ]

admin.site.register(Audience)
admin.site.register(Axis)
admin.site.register(Card, CardAdmin)
admin.site.register(Like)
admin.site.register(Image)