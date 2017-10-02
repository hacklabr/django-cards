from rest_framework import permissions
from django.conf import settings


class IsUserOrReadAndCreate(permissions.IsAuthenticated):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.user == request.user


class InAdminGroupOrCreatorOrReadAndCreate(permissions.IsAuthenticated):
    """
    If user is in admin group, can alter and delete.
    If user is the creator of the object, can alter and delete.
    Else, only able to read and create.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if bool(set([g.name for g in request.user.groups.all()]) & set(settings.DJANGO_CARDS_ADMIN_GROUPS)):
            return True

        if obj.user == request.user:
            return True

        return False
