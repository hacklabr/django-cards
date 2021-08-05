(function() {
    'use strict';
    angular.
        module('cardDetail').
        component('cardDetail', {
            templateUrl: '/cards/card-detail.template.html',
            controller: CardsDetailController,
            bindings: {
                card: '<',
            },
        });

    CardsDetailController.$inject = [
        '$scope',
        '$rootScope',
        '$state',
        '$stateParams',
        '$sce',
        '$uibModal',
        'Cards',
        'Likes',
        'Audiences',
        'Axes',
        'Tags',
        'CardFile',
        'YouTubeEmbeds',
        'UserActions',
        'gettextCatalog'
    ];
    function CardsDetailController ($scope, $rootScope, $state, $stateParams, $sce, $uibModal, Cards, Likes, Audiences, Axes, Tags, CardFile, YouTubeEmbeds, UserActions, gettextCatalog) {

        (new UserActions({
          verb: "access",
          action_object_id: $stateParams.cardId,
          action_object_type: "Card",
          target_id: $stateParams.classroomId,
          target_type: "Classroom"
        })).$save();

        var ctrl = this;

        ctrl.$onInit = function() {
            $scope.card_id = $stateParams.cardId;
            $scope.card = Cards.get({id: $scope.card_id}, function(response) {
                $scope.card = response;
                var image_slides = $scope.card.image_gallery.map(function(img) {
                    return {type: 'image', el: img};
                });
                var video_slides = $scope.card.youtube_embeds.map(function(video) {
                    return {type: 'video', el: video};
                });
                $scope.slides = image_slides.concat(video_slides);
            });
        };

        $scope.toggle_like = function() {
            if ($scope.card.user_liked) {
                Likes.delete({id: $scope.card.user_liked}).$promise.then(function() {
                    $scope.card.user_liked = null;
                    $scope.card.likes -= 1;
                });
            }
            else {
                Likes.save({card: $scope.card.id}).$promise.then(function(response) {
                    $scope.card.user_liked = response.id;
                    $scope.card.likes += 1;
                });
                (new UserActions({
                  verb: "reacted",
                  action_object_id: $stateParams.cardId,
                  action_object_type: "Card",
                  target_id: $stateParams.classroomId,
                  target_type: "Classroom"
                })).$save();
            }
        }

        function start_rootscope() {
            $rootScope.card_filter = {};
            $rootScope.card_filter.keyword = '';
            $rootScope.card_filter.audience = '';
            $rootScope.card_filter.axis = '';
            $rootScope.card_filter.status = '';
            $rootScope.card_filter.tags = [];
        }

        $scope.filter_by_audience = function(audience) {
            if (!$rootScope.card_filter)
                start_rootscope();
            $rootScope.card_filter.audience = audience;
            window.location.replace('#!/');
        };
        $scope.filter_by_axis = function(axis) {
            if (!$rootScope.card_filter)
                start_rootscope();
            $rootScope.card_filter.axis = axis;
            window.location.replace('#!/');
        };
        $scope.filter_by_tag = function(tag) {
            if (!$rootScope.card_filter)
                start_rootscope();
            $rootScope.card_filter.tags.push({name: tag});
            window.location.replace('#!/');
        };

        $scope.delete_card = function() {
            let text = gettextCatalog.getString('Do you want to exclude this card?');
            if (window.confirm(text)) {
                if ($scope.card.editable) {
                    Cards.delete({id: $scope.card.id}).$promise.then(function(response) {
                        $state.go('cardsList');
                    }).catch(function(error) {
                        let text = gettextCatalog.getString('Unable to delete card.');
                        $scope.error_messages.push(text);
                        console.error(error);
                    });
                }
            }
        };

        $scope.editCard = function (card) {
            $rootScope.card = card
            const modalInstance = $uibModal.open({
                templateUrl: "_create_new_card_modal.html",
                controller: [
                    "$scope",
                    "$rootScope",
                    "$uibModalInstance",
                    "Images",
                    "YouTubeEmbeds",
                    CardEditModalInstanceController,
                ],
            });
            modalInstance.result.then(function (new_card) {
                console.log(new_card)
            });
        }
        const CardEditModalInstanceController = (
            $scope,
            $rootScope,
            $uibModalInstance,
            Images,
            YouTubeEmbeds
          ) => {
              $scope.card = $rootScope.card
              $scope.backupCard = angular.copy($rootScope.card)

              $scope.slides = [];
              var image_slides = $scope.card.image_gallery.map(function(img) {
                  return {type: 'image', el: img};
              });
              var video_slides = $scope.card.youtube_embeds.map(function(video) {
                  return {type: 'video', el: video};
              });

              for (var i = 0; i < image_slides.length; i++) {
                $scope.slides.push({
                  type: "image",
                  data: image_slides[i].el,
                });
              }
              for (var i = 0; i < video_slides.length; i++) {
                $scope.slides.push({
                  type: "video",
                  data: video_slides[i].el,
                });
              }

              $scope.error_messages = [];
              $scope.editing_mode = false;

              $scope.audiences = Audiences.query();
              $scope.axes = Axes.query();
              $scope.tags = Tags.query();

              $scope.proxy = {};
              $scope.proxy.tags = [];

              $scope.cancel = function () {
                $scope.card = $scope.backupCard
                $uibModalInstance.dismiss();
                ctrl.$onInit();
              };

              $scope.new_tag = function(new_tag) {
                  if (new_tag.length <= 12) {
                      return {
                          name: new_tag.toLowerCase()
                      };
                  }
                  else {
                      window.alert(gettextCatalog.getString(
                        'It is not allowed to insert a tag with more than 12 characters.'));
                  }
              };
              $scope.tag_exists = function (new_tag) {
                for (var i = 0; i < $scope.tags.length; i++)
                  if ($scope.tags[i].name == new_tag) return true;
                return false;
              };

              $scope.card.authors = [];
              $scope.add_author = function () {
                $scope.card.authors.push({
                  author_name: "",
                  author_description: "",
                });
              };

              /* Slider */
              $scope.mode = {
                ADD_MEDIA: 0,
                ADD_IMAGE: 1,
                ADD_VIDEO: 2,
                SHOW_MEDIA: 3,
              };

              if ($scope.slides.length) {
                $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                $scope.dirty_slide = false;
                $scope.selected_slide_index = 0;
                $scope.selected_slide = $scope.slides[0];
              } else {
                $scope.slide_mode = $scope.mode.ADD_MEDIA;
                $scope.dirty_slide = true;
              }

              $scope.new_slide = function (index) {
                $scope.selected_slide_index = $scope.slides.length + 1;
                $scope.slide_mode = $scope.mode.ADD_MEDIA;
                $scope.dirty_slide = true;
              };
 
              function valid_card() {
                $scope.error_messages = [];
                if (!$scope.card.title || $scope.card.title == "")
                  $scope.error_messages.push(gettextCatalog.getString(
                    "Title is required field!"));
                if (
                  !$scope.card.audience ||
                  !$scope.card.audience.id ||
                  $scope.card.audience.id == ""
                )
                  $scope.error_messages.push(gettextCatalog.getString(
                    "Theme is required field!"));
                if (
                  !$scope.card.axis ||
                  !$scope.card.axis.id ||
                  $scope.card.axis.id == ""
                )
                  $scope.error_messages.push(gettextCatalog.getString(
                    "Format is mandatory field!"));
                return $scope.error_messages.length == 0;
              }

              $scope.create_card = function () {
                if (valid_card()) {
                  $scope.card.image_gallery = $scope.slides
                    .filter(function (media) {
                      return media.type == "image";
                    })
                    .map(function (media) {
                      return media.data;
                    });
                  $scope.card.youtube_embeds = $scope.slides
                    .filter(function (media) {
                      return media.type == "video";
                    })
                    .map(function (media) {
                      return media.data;
                    });
                  $scope.card.tags = $scope.proxy.tags.map(function (tag) {
                    return tag.name;
                  });

                  $scope.card.groups = [$rootScope.currentClassroom.group.id,]

                  Cards.update($scope.card).$promise.then(function (response) {
                      $scope.unsaved_content = false;

                      // Re-run parent's onInit to update its data
                      ctrl.$onInit();

                      // Close edit modal
                      $uibModalInstance.close(response);
                    })
                    .catch(function (error) {
                      $scope.error_messages.push(
                        gettextCatalog.getString(
                          "Unable to create content."
                        )
                      );
                      console.error(error);
                    });
                }
              };

              /* Images */
              $scope.upload_image = function (file) {
                if (file) {
                  Images.upload(file, "")
                    .then(function (response) {
                      var last_image = -1;
                      for (var i = 0; i < $scope.slides.length; i++) {
                        if ($scope.slides[i].type == "image") last_image = i;
                        else break;
                      }
                      $scope.slides.splice(last_image + 1, 0, {
                        type: "image",
                        data: response.data,
                      });
                      $scope.selected_slide_index = last_image + 1;
                      $scope.selected_slide =
                        $scope.slides[$scope.selected_slide_index];
                      $scope.dirty_slide = false;
                      $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                    })
                    .catch(function (error) {
                      $scope.error_messages.push(
                        gettextCatalog.getString(
                          "Unable to save image"
                        )
                      );
                      console.error(error);
                    });
                }
              };
              function remove_image(index) {
                if (window.confirm(
                  gettextCatalog.getString("Do you really want to delete this image?"))){
                  return Images.delete({ id: $scope.slides[index].data.id })
                    .$promise;
                  }
              }

              /* Files */
              $scope.uploadCardFiles = function (file, card) {
                if (file) {
                  CardFile.upload(file).then(
                    function (response) {
                      var card_file = new CardFile(response.data);

                      if (card.files === undefined) card.files = [];
                      card.files.push(card_file);
                      return { location: card_file.file };
                    },
                    function (response) {
                      if (response.status > 0) {
                        $scope.errorMsg = response.status + ": " + response.data;
                      }
                    },
                    function (evt) {
                      card.progress = Math.min(
                        100,
                        parseInt((100.0 * evt.loaded) / evt.total)
                      );
                    }
                  );
                }
              };

              /* Videos */
              $scope.embed_video = function () {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = "";
                var youtube_id;
                if (result && result[2].length == 11) {
                  youtube_id = result[2];
                }
                YouTubeEmbeds.save({ video_id: youtube_id })
                  .$promise.then(function (response) {
                    $scope.slides.push({
                      type: "video",
                      data: response,
                    });
                    $scope.selected_slide_index = $scope.slides.length - 1;
                    $scope.selected_slide =
                    $scope.slides[$scope.selected_slide_index];
                    $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                    $scope.dirty_slide = false;
                    $scope.video_url = "";
                  })
                  .catch(function (error) {
                    $scope.error_messages.push(
                      gettextCatalog.getString(
                        "Could not save video."
                      )
                    );
                    console.error(error);
                  });
              };
              function remove_video(index) {
                if (window.confirm(gettextCatalog.getString("Do you really want to delete this video?")))
                  return YouTubeEmbeds.delete({
                    id: $scope.slides[index].data.id,
                  }).$promise;
              }

              /* Media - Generic */
              $scope.select_media = function (index) {
                $scope.selected_slide_index = index;
                $scope.selected_slide = $scope.slides[index];
                $scope.slide_mode = $scope.mode.SHOW_MEDIA;
              };

              $scope.remove_media = function (index) {
                var media_type, promise;
                if ($scope.slides[index].type == "image") {
                  media_type = "image";
                  promise = remove_image(index);
                } else if ($scope.slides[index].type == "video") {
                  media_type = "video";
                  promise = remove_video(index);
                }
                promise.then(
                  function () {
                    /* Media was successfully removed. */
                    $scope.slides.splice(index, 1);
                    if ($scope.slides.length == index) {
                      /* We removed the last-index slide */
                      if (index == 0) {
                        /* No more slides remaining */
                        $scope.slide_mode = $scope.mode.ADD_MEDIA;
                        $scope.dirty_slide = true;
                      } else {
                        $scope.selected_slide_index = $scope.slides.length - 1;
                        $scope.selected_slide =
                          $scope.slides[$scope.selected_slide_index];
                      }
                    } else {
                      $scope.selected_slide_index = index;
                      $scope.selected_slide = $scope.slides[index];
                    }
                  },
                  function (error) {
                    /* Media removal failed. */
                    if (media_type == "image")
                      $scope.error_messages.push(
                        gettextCatalog.getString(
                          "Could not delete image.")
                      );
                    else if (media_type == "video")
                      $scope.error_messages.push(
                        gettextCatalog.getString(
                          "Unable to delete the video.")
                      );
                    console.error(error);
                  }
                );
              };

              $scope.is_selected_media = function (index) {
                if (($scope.selected_slide_index == index) ||
                    ($scope.mode.ADD_MEDIA && $scope.slides.length == index - 1)) {
                    return "btn-primary";
                }
                return "btn-default";
              };

              $scope.safe_url = function (url) {
                return $sce.trustAsResourceUrl(url);
              };

              $uibModalInstance.result.finally(function(){
                $scope.cancel();
              });
          };

        /* Slider*/
        $scope.active_slide = 0;
        $scope.safe_url = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        $scope.safe_html = function(text) {
            return $sce.trustAsHtml(text);
        };
    }
})();
