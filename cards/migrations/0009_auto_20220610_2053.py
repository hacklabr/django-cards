# Generated by Django 2.2.28 on 2022-06-10 23:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0008_auto_20210506_1504'),
    ]

    operations = [
        migrations.AddField(
            model_name='cardfile',
            name='card_slide_index',
            field=models.IntegerField(blank=True, null=True, verbose_name='Card slide index'),
        ),
        migrations.AddField(
            model_name='image',
            name='card_slide_index',
            field=models.IntegerField(blank=True, null=True, verbose_name='Card slide index'),
        ),
    ]
