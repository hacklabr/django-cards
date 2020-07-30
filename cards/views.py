from django.shortcuts import render
from rest_framework import viewsets, filters, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import IsAuthenticated

from .models import Audience, Axis, Card, Image, Like, YoutubeEmbed, CardFile
from .serializers import AudienceSerializer, AxisSerializer, CardSerializer, LikeSerializer, ImageSerializer, TagsInCardsSerializer, YoutubeEmbedSerializer, CardFileSerializer
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.db.models import Q

import django_filters.rest_framework

from .permissions import IsUserOrReadAndCreate, InAdminGroupOrCreatorOrReadAndCreate
from .filters import CardsSearchFilter

class AudienceViewSet(viewsets.ReadOnlyModelViewSet):

    model = Audience
    queryset = Audience.objects.all()
    serializer_class = AudienceSerializer

# class AuthorsViewSet(viewsets.ModelViewSet):
#     model = Authors
#     queryset = Authors.objects.all()
#     serializer_class = AuthorsSerializer


class AxisViewSet(viewsets.ReadOnlyModelViewSet):

    model = Axis
    queryset = Axis.objects.all()
    serializer_class = AxisSerializer


class CardViewSet(viewsets.ModelViewSet):

    model = Card
    queryset = Card.objects.all()
    serializer_class = CardSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, CardsSearchFilter)
    filter_fields = ('audience__name', 'axis__name', 'is_certified', 'tags__name', 'groups')
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = LimitOffsetPagination
    search_fields = [
        'development',
        'hint',
        'know_more',
        'text',
        'title',
        'you_will_need',
        'lead',
        'author__first_name',
        'author__last_name'
    ]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        """
        The big idea in this update:
        - User can only update hers non-certified cards
        - if User in admin_group, can edit anything
        """
        obj = self.get_object()
        # I'm converting both lists to sets and asking if their intersection is non-empty
        if bool(set([g.name for g in self.request.user.groups.all()]) & set(settings.DJANGO_CARDS_ADMIN_GROUPS)):
            # Although Card is being modified, original user remains
            serializer.save(author=obj.author)
        elif not obj.is_certified:
            if obj.author == self.request.user:
                serializer.save(author=self.request.user)
        else:
            raise PermissionDenied(detail=_('you do not have permission to alter this card'))

    def get_queryset(self):
        queryset = super().get_queryset()

        if bool(set(settings.DJANGO_CARDS_ADMIN_GROUPS) & set(g.name for g in self.request.user.groups.all())):
            return queryset

        # if not self.request.user.is_superuser:
        #     queryset = queryset.filter(
        #     # Certified cards are available for everyone
        #         Q(is_certified=True)
        #         | Q(is_public=True)
        #         # NON certified cards are only available for users in the group
        #         | Q(groups__in=self.request.user.groups.all())
        #         | Q(author=self.request.user)
        #         # | Q(groups__workspace__groups__in=self.request.user.groups.all())
        #     )

        queryset = queryset.select_related(
            'audience',
            'author',
            'axis',
        )
        queryset = queryset.prefetch_related(
            'groups',
        )

        return queryset.distinct()


class ImageViewSet(viewsets.ModelViewSet):

    model = Image
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = (InAdminGroupOrCreatorOrReadAndCreate,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class CardFileViewSet(viewsets.ModelViewSet):
    queryset = CardFile.objects.all()
    serializer_class = CardFileSerializer
    permission_classes = [IsAuthenticated]


class LikeViewSet(viewsets.ModelViewSet):
    model = Like
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = (IsUserOrReadAndCreate,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class TagsViewSet(viewsets.ModelViewSet):

    queryset = Card.tags.all()
    serializer_class = TagsInCardsSerializer

    # model = Card


class YoutubeEmbedViewSet(viewsets.ModelViewSet):

    model = YoutubeEmbed
    queryset = YoutubeEmbed.objects.all()
    serializer_class = YoutubeEmbedSerializer
    permission_classes = (permissions.IsAuthenticated,)


def cards_view(request):
    return render(request, 'cards.html', {})

def cards_list_view(request):
    return render(request, 'cards-list.html', {})

def card_new_view(request):
    return render(request, 'card-new.html', {})

def card_detail_view(request, *args, **kwargs):
    return render(request, 'card-detail.html', {})

def card_edit_view(request, *args, **kwargs):
    return render(request, 'card-edit.html', {})
