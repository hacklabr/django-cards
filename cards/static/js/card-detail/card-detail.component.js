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
        '$stateParams',
        '$sce',
        '$uibModal',
        'Cards',
        'Likes',
        'Audiences',
        'Axes',
        'Tags',
        'CardFile',
    ];

    function CardsDetailController ($scope, $rootScope, $stateParams, $sce, $uibModal, Cards, Likes, Audiences, Axes, Tags, CardFile) {

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
            if (window.confirm('Deseja mesmo excluir essa prática?')) {
                if ($scope.card.editable) {
                    Cards.delete({id: $scope.card.id}).$promise.then(function(response) {
                        window.location.replace('#!/');
                    }).catch(function(error) {
                        $scope.error_messages.push('Não foi possível excluir a prática.');
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
            Images
          ) => {
            console.log($scope)
            $scope.card = $rootScope.card
            console.log($rootScope)
                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
              $scope.slides = [];
              $scope.error_messages = [];
              $scope.editing_mode = false;

              $scope.audiences = Audiences.query();
              $scope.axes = Axes.query();
              $scope.tags = Tags.query();

              $scope.proxy = {};
              $scope.proxy.tags = [];
              $scope.new_tag = function(new_tag) {
                  if (new_tag.length <= 12) {
                      return {
                          name: new_tag.toLowerCase()
                      };
                  }
                  else {
                      window.alert('Não é permitido inserir tag com mais de 12 caracteres.');
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
              $scope.slide_mode = $scope.mode.ADD_MEDIA;
              $scope.dirty_slide = true;
              $scope.new_slide = function () {
                $scope.slide_mode = $scope.mode.ADD_MEDIA;
                $scope.dirty_slide = true;
              };

              function valid_card() {
                $scope.error_messages = [];
                if (!$scope.card.title || $scope.card.title == "")
                  $scope.error_messages.push("Título é campo obrigatório!");
                if (
                  !$scope.card.audience ||
                  !$scope.card.audience.id ||
                  $scope.card.audience.id == ""
                )
                  $scope.error_messages.push("Tema é campo obrigatório!");
                if (
                  !$scope.card.axis ||
                  !$scope.card.axis.id ||
                  $scope.card.axis.id == ""
                )
                  $scope.error_messages.push("Formato é campo obrigatório!");
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
                      $uibModalInstance.close(response)
                    })
                    .catch(function (error) {
                      $scope.error_messages.push(
                        "Não foi possível criar o conteúdo."
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
                      $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                      $scope.dirty_slide = false;
                    })
                    .catch(function (error) {
                      $scope.error_messages.push(
                        "Não foi possível salvar a imagem."
                      );
                      console.error(error);
                    });
                }
              };
              function remove_image(index) {
                if (window.confirm("Deseja mesmo excluir essa imagem?"))
                  return Images.delete({ id: $scope.slides[index].data.id })
                    .$promise;
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
                      "Não foi possível salvar o vídeo."
                    );
                    console.error(error);
                  });
              };
              function remove_video(index) {
                if (window.confirm("Deseja mesmo excluir esse vídeo?"))
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
                        "Não foi possível excluir a imagem."
                      );
                    else if (media_type == "video")
                      $scope.error_messages.push(
                        "Não foi possível excluir o vídeo."
                      );
                    console.error(error);
                  }
                );
              };
              $scope.is_selected_media = function (index) {
                if ($scope.selected_slide_index == index) return "btn-primary";
                return "btn-default";
              };

              $scope.safe_url = function (url) {
                return $sce.trustAsResourceUrl(url);
              };
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