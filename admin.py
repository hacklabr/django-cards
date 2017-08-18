from django.contrib import admin
from .models import Audience, Axis, Card, Image
import tagulous

admin.site.register(Audience)
# Card has tags, so I need to use
# tagulous built-in helper function for adding to admin
tagulous.admin.register(Card)
admin.site.register(Image)