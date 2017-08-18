# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import tagulous.models.fields
from django.conf import settings
import tagulous.models.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='_Tagulous_Card_tags',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=255)),
                ('slug', models.SlugField()),
                ('count', models.IntegerField(default=0, help_text='Internal counter of how many times this tag is in use')),
                ('protected', models.BooleanField(default=False, help_text='Will not be deleted when the count reaches 0')),
            ],
            options={
                'ordering': ('name',),
                'abstract': False,
            },
            bases=(tagulous.models.models.BaseTagModel, models.Model),
        ),
        migrations.CreateModel(
            name='Audience',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('description', models.TextField(verbose_name='Description', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Authors',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('author_name', models.CharField(max_length=255, verbose_name='Author Name')),
                ('author_description', models.TextField(verbose_name='Author Description', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Axis',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='Name')),
                ('description', models.TextField(verbose_name='Description', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Card',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('development', models.TextField(verbose_name='Development', blank=True)),
                ('hint', models.TextField(verbose_name='Hints', blank=True)),
                ('is_certified', models.NullBooleanField(verbose_name='Card was certified')),
                ('know_more', models.TextField(verbose_name='Know More About', blank=True)),
                ('text', models.TextField(verbose_name='Text', blank=True)),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('you_will_need', models.TextField(verbose_name='Requirements for this', blank=True)),
                ('audience', models.ForeignKey(blank=True, to='django_cards.Audience', null=True)),
                ('author', models.ForeignKey(verbose_name='Author', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('axis', models.ForeignKey(blank=True, to='django_cards.Axis', null=True)),
                ('tags', tagulous.models.fields.TagField(help_text='Enter a comma-separated tag string', to='django_cards._Tagulous_Card_tags', null=True, _set_tag_meta=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(upload_to=b'')),
                ('description', models.TextField(verbose_name='Description', blank=True)),
                ('card', models.ForeignKey(related_name='image_gallery', to='django_cards.Card')),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('card', models.ForeignKey(to='django_cards.Card')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='YoutubeEmbed',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(max_length=255)),
                ('card', models.ForeignKey(related_name='youtube_embeds', to='django_cards.Card')),
            ],
        ),
        migrations.AddField(
            model_name='authors',
            name='card',
            field=models.ForeignKey(related_name='authors', to='django_cards.Card'),
        ),
        migrations.AlterUniqueTogether(
            name='_tagulous_card_tags',
            unique_together=set([('slug',)]),
        ),
    ]
