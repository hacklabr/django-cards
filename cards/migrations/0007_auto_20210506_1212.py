# Generated by Django 2.2.21 on 2021-05-06 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0006_auto_20210506_0907'),
    ]

    operations = [
        migrations.AddField(
            model_name='youtubeembed',
            name='video_id_en',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='youtubeembed',
            name='video_id_es',
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='youtubeembed',
            name='video_id_pt_br',
            field=models.CharField(max_length=255, null=True),
        ),
    ]