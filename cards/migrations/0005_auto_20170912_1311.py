# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0004_card_lead'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='audience',
            field=models.ForeignKey(default=1, to='cards.Audience'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='card',
            name='axis',
            field=models.ForeignKey(default=1, to='cards.Axis'),
            preserve_default=False,
        ),
    ]
