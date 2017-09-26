from rest_framework import permissions


# Overriding
class IsUserOrReadAndCreate(permissions.IsAuthenticated):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.user == request.user

# class IsAuthorOrReadAndCreate(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, obj):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#
#         return obj.author == request.user