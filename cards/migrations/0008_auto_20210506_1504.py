# Generated by Django 2.2.21 on 2021-05-06 18:04

from django.db import migrations, models
import django.db.models.deletion
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0003_taggeditem_add_unique_index'),
        ('cards', '0007_auto_20210506_1212'),
    ]

    operations = [
        migrations.CreateModel(
            name='CardTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='card',
            name='tags',
            field=taggit.managers.TaggableManager(blank=True, help_text='A comma-separated list of tags.', through='cards.CardTag', to='taggit.Tag', verbose_name='Tags'),
        ),
        migrations.AddField(
            model_name='cardtag',
            name='content_object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cards.Card'),
        ),
        migrations.AddField(
            model_name='cardtag',
            name='tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cards_cardtag_items', to='taggit.Tag'),
        ),
        migrations.AddField(
            model_name='cardtag',
            name='tag_en',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cards_cardtag_items', to='taggit.Tag'),
        ),
        migrations.AddField(
            model_name='cardtag',
            name='tag_es',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cards_cardtag_items', to='taggit.Tag'),
        ),
        migrations.AddField(
            model_name='cardtag',
            name='tag_pt_br',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='cards_cardtag_items', to='taggit.Tag'),
        ),
    ]
