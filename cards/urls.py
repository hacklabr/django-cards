# -*- coding: utf-8 -*-
from django.conf.urls import include, url
from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)

router.register(r'cards', views.CardViewSet, base_name='cards')
router.register(r'youtube_embeds', views.YoutubeEmbedViewSet, base_name='youtube_embeds')
router.register(r'likes', views.LikeViewSet, base_name='likes')

urlpatterns = {
    url(r'^$', views.cards_view, name='cards_page'),
    url(r'^api/', include(router.urls)),
}