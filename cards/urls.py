# -*- coding: utf-8 -*-
from django.conf.urls import include, url
from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)

router.register(r'cards', views.CardViewSet, base_name='Card')
router.register(r'likes', views.LikeViewSet)
router.register(r'youtube_embeds', views.YoutubeEmbedViewSet)

urlpatterns = {
    url(r'^api/', include(router.urls)),

}