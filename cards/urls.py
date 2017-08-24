# -*- coding: utf-8 -*-
from django.conf.urls import include, url
from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)

router.register(r'', views.CardViewSet, base_name='Card')
router.register(r'likes', views.LikeViewSet)
router.register(r'youtube_embeds', views.YoutubeEmbedViewSet)

urlpatterns = {
    url(r'^$', views.cards_view, name='cards'),
    url(r'(?P<slug>[-a-zA-Z0-9_]+)$', views.card_detail_view, name='cards-detail'),
    url(r'^api/', include(router.urls)),
}