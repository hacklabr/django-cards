from django.test import TestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate
from .models import Audience, Authors, Axis, Card, Image, Like, YoutubeEmbed
from paralapraca.models import Group
from django.contrib.auth import get_user_model
from pprint import pprint
from .views import CardViewSet


class CardUpdateLogicTests(TestCase):

    def setUp(self):
        self.author = get_user_model().objects.create(username='author', email='author@whatever.com')
        self.random_dude = get_user_model().objects.create(username='random_dude', email='random_dude@whatever.com')

        self.admin_user_1 = get_user_model().objects.create(username='admin_user_1', email='adminuser1@whatever.com')
        self.admin_user_2 = get_user_model().objects.create(username='admin_user_2', email='adminuser2@whatever.com')
        self.admin_group_1 = Group.objects.create(name='treta')
        self.admin_group_2 = Group.objects.create(name='admin_group_2')
        self.admin_user_1.groups.add(self.admin_group_1)
        self.admin_user_1.save()
        self.admin_user_2.groups.add(self.admin_group_2)
        self.admin_user_2.save()

    def test_certified_card_can_not_be_edited_by_author(self):
        card = Card.objects.create(author=self.author, is_certified=True)
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'This should be refused'})
        force_authenticate(request, user=self.author)
        response = CardViewSet.as_view({'put': 'update'})(request, pk=card.pk)
        self.assertEqual(response.status_code, 403)

    def test_non_certified_card_can_be_edited_by_author(self):
        card = Card.objects.create(author=self.author, is_certified=False, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'This should be allowed'})
        force_authenticate(request, user=self.author)
        response = CardViewSet.as_view({'put': 'update'})(request, pk=card.pk)
        self.assertEqual(response.status_code, 200)

    def test_non_certified_card_can_only_be_edited_by_author(self):
        card = Card.objects.create(author=self.author, is_certified=False, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'This should be refused'})
        force_authenticate(request, user=self.random_dude)
        response = CardViewSet.as_view({'put': 'update'})(request)
        self.assertEqual(response.status_code, 403)

    @override_settings(DJANGO_CARDS_ADMIN_GROUPS = ('admin_group_1', 'admin_group_2'))
    def test_certified_card_can_be_edited_only_by_someone_in_the_right_group(self):
        card = Card.objects.create(author=self.author, is_certified=True, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'Admin changing title'})
        force_authenticate(request, user=self.admin_user_1)
        response = CardViewSet.as_view({'put': 'update'})(request, pk=card.pk)
        self.assertEqual(response.status_code, 200)

    @override_settings(DJANGO_CARDS_ADMIN_GROUPS=('admin_group_1', 'admin_group_2'))
    def test_certified_card_can_be_edited_only_by_someone_in_the_right_group_2(self):
        card = Card.objects.create(author=self.author, is_certified=True, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'Admin changing title'})
        force_authenticate(request, user=self.admin_user_2)
        response = CardViewSet.as_view({'put': 'update'})(request)
        self.assertEqual(response.status_code, 200)

    @override_settings(DJANGO_CARDS_ADMIN_GROUPS=('admin_group_1', 'admin_group_2'))
    def test_certified_card_can_be_edited_only_by_someone_in_the_right_group_and_change_is_made(self):
        card = Card.objects.create(author=self.author, is_certified=True, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'Admin changing title'})
        force_authenticate(request, user=self.admin_user_1)
        response = CardViewSet.as_view({'put': 'update'})(request)
        self.assertEqual(response.data['title'], 'Admin changing title')

    @override_settings(DJANGO_CARDS_ADMIN_GROUPS=('admin_group_1', 'admin_group_2'))
    def test_certified_card_can_be_edited_only_by_someone_in_the_right_group_and_author_remains_the_same(self):
        card = Card.objects.create(author=self.author, is_certified=True, title='Whatever')
        factory = APIRequestFactory()
        request = factory.put('/cards/api/cards/{}'.format(card.id),
                              {'title': 'Admin changing title'})
        force_authenticate(request, user=self.admin_user_1)
        response = CardViewSet.as_view({'put': 'update'})(request)
        self.assertEqual(response.data['author']['id'], self.author.id)