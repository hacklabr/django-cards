# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0006_auto_20170912_1604'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='card',
            options={'ordering': ['-id']},
        ),
        migrations.AlterModelOptions(
            name='image',
            options={'ordering': ['id']},
        ),
        migrations.AlterModelOptions(
            name='youtubeembed',
            options={'ordering': ['id']},
        ),
        migrations.AlterField(
            model_name='image',
            name='image',
            field=models.ImageField(upload_to=b'cards_images/'),
        ),
    ]
