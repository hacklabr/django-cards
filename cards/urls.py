from django.conf.urls import include, url
from django.views.generic import TemplateView

from rest_framework import routers

from . import views

router = routers.SimpleRouter(trailing_slash=False)

router.register(r'audience', views.AudienceViewSet, base_name='audience')
router.register(r'audiences', views.AudiencesPageViewSet, base_name='audiences')
# router.register(r'authors', views.AuthorsViewSet, base_name='authors')
router.register(r'axis', views.AxisViewSet, base_name='axis')
router.register(r'axes', views.AxesPageViewSet, base_name='axes')
router.register(r'cards', views.CardViewSet, base_name='cards')
router.register(r'tags', views.TagsViewSet, base_name='tags')
router.register(r'images', views.ImageViewSet, base_name='image')
router.register(r'card-file', views.CardFileViewSet)
router.register(r'youtube_embeds', views.YoutubeEmbedViewSet, base_name='youtube_embeds')
router.register(r'likes', views.LikeViewSet, base_name='likes')

app_name = 'cards'

urlpatterns = (
    url(r'^api/', include(router.urls)),
)
