# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0003_image_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='lead',
            field=models.CharField(max_length=255, verbose_name='Lead', blank=True),
        ),
    ]
