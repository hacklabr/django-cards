# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0002_auto_20150616_2121'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
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
                ('is_certified', models.BooleanField(default=False, verbose_name='Card was certified')),
                ('know_more', models.TextField(verbose_name='Know More About', blank=True)),
                ('text', models.TextField(verbose_name='Text', blank=True)),
                ('title', models.CharField(max_length=255, verbose_name='Title')),
                ('you_will_need', models.TextField(verbose_name='Requirements for this', blank=True)),
                ('audience', models.ForeignKey(blank=True, to='cards.Audience', null=True)),
                ('author', models.ForeignKey(verbose_name='Author', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('axis', models.OneToOneField(null=True, blank=True, to='cards.Axis')),
                ('tags', taggit.managers.TaggableManager(to='taggit.Tag', through='taggit.TaggedItem', blank=True, help_text='A comma-separated list of tags.', verbose_name='Tags')),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('image', models.ImageField(upload_to=b'')),
                ('description', models.TextField(verbose_name='Description', blank=True)),
                ('card', models.ForeignKey(related_name='image_gallery', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='cards.Card', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('card', models.ForeignKey(to='cards.Card')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='YoutubeEmbed',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('url', models.URLField(max_length=255)),
                ('card', models.ForeignKey(related_name='youtube_embeds', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='cards.Card', null=True)),
            ],
        ),
        migrations.AddField(
            model_name='authors',
            name='card',
            field=models.ForeignKey(related_name='authors', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='cards.Card', null=True),
        ),
    ]
