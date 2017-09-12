# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0005_auto_20170912_1311'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='youtubeembed',
            name='url',
        ),
        migrations.AddField(
            model_name='youtubeembed',
            name='video_id',
            field=models.CharField(default='abc', max_length=255),
            preserve_default=False,
        ),
    ]
