(function(angular){
    'use strict';
    var app = angular.module('cards.controllers', ['ngCookies']);

    app.controller('CardsListCtrl', ['$scope', '$rootScope', '$http', 'Audiences', 'Axes', 'Cards', 'Likes', 'Tags', 'YouTubeEmbeds',
        function($scope, $rootScope, $http, Audiences, Axes, Cards, Likes, Tags, YouTubeEmbeds) {

            /* Services bindings */
            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.cards = {};
            Tags.query().$promise.then(function(response) {
                $scope.tags = response.sort(function(a, b) {
                    if (a.name < b.name)
                        return -1;
                    else if (a.name > b.name)
                        return 1;
                    else
                        return 0;
                });
            });

            $scope.show_filter_options = false;
            $scope.keyword = '';
            if (!$rootScope.card_filter) {
                $rootScope.card_filter = {};
                $rootScope.card_filter.keyword = '';
                $rootScope.card_filter.audience = '';
                $rootScope.card_filter.axis = '';
                $rootScope.card_filter.status = '';
                $rootScope.card_filter.tags = [];
            }

            $scope.clean_filters = function() {
                $scope.keyword = '';
                $rootScope.card_filter.keyword = '';
                $rootScope.card_filter.audience = '';
                $rootScope.card_filter.axis = '';
                $rootScope.card_filter.status = '';
                $rootScope.card_filter.tags = [];
                $scope.get_cards();
            }

            $scope.card_image = function(card) {
                if (card.image_gallery.length > 0)
                    return card.image_gallery[0].image;
                return '/static/img/card-default.png';
            };

            /* Because modulo operation is **very wrongly** defined in JS for negative numbers. */
            function safe_mod(m, n) {
                return ((m % n) + n) % n;
            }

            function get_slides_row(arr, start) {
                if (arr.length < 3)
                    return arr;
                var new_row = [];
                for (var i = 0; i < 3; i++)
                    new_row[i] = arr[safe_mod(i + start, arr.length)];
                return new_row;
            }

            $scope.certified_base_slide = 0;
            $scope.community_base_slide = 0;
            $scope.certified_slides_down = function() {
                $scope.slider.certified = get_slides_row($scope.cards.certified, --$scope.certified_base_slide);
            }
            $scope.certified_slides_up = function() {
                $scope.slider.certified = get_slides_row($scope.cards.certified, ++$scope.certified_base_slide);
            }
            $scope.community_slides_down = function() {
                $scope.slider.community = get_slides_row($scope.cards.community, --$scope.community_base_slide);
            }
            $scope.community_slides_up = function() {
                $scope.slider.community = get_slides_row($scope.cards.community, ++$scope.community_base_slide);
            }

            function filter_by_status() {
                $scope.cards.certified = $scope.cards.all.slice(0).
                    filter(function(elem) {
                        return elem.is_certified;
                    });
                $scope.cards.community = $scope.cards.all.slice(0).
                    filter(function(elem) {
                        return !elem.is_certified;
                    });
            }

            $scope.slider = {};

            $scope.blank_filters = true;

            $scope.get_cards = function() {
                $rootScope.card_filter.keyword = $scope.keyword;
                $scope.blank_filters =
                    $rootScope.card_filter.keyword === '' &&
                    $rootScope.card_filter.audience === '' &&
                    $rootScope.card_filter.axis === '' &&
                    $rootScope.card_filter.status === '' &&
                    $rootScope.card_filter.tags.length === 0;
                Cards.query({
                    audience__name: $rootScope.card_filter.audience,
                    axis__name: $rootScope.card_filter.axis,
                    is_certified: $rootScope.card_filter.status,
                    search: $rootScope.card_filter.keyword,
                    tags__name: $rootScope.card_filter.tags.map(function(tag) {
                        return tag.name;
                    })
                }).$promise.then(function(data) {
                    $scope.cards.all = data;
                    filter_by_status();
                    $scope.certified_base_slide = 0;
                    $scope.community_base_slide = 0;
                    $scope.slider.certified = get_slides_row($scope.cards.certified, $scope.certified_base_slide);
                    $scope.slider.community = get_slides_row($scope.cards.community, $scope.community_base_slide);
                });
            };

            /* Tags - old */
            // $scope.tag = '';
            // $scope.insert_tag = function(tag) {
            //     if (tag !== '' && $rootScope.card_filter.tags.indexOf(tag) == -1) {
            //         $rootScope.card_filter.tags.push(tag.toLowerCase());
            //         $scope.get_cards();
            //     }
            //     $scope.tag = '';
            // };
            // $scope.remove_tag = function(index) {
            //     $rootScope.card_filter.tags.splice(index, 1);
            //     $scope.get_cards();
            // };

            /* Tags */
            $scope.new_tag = function(new_tag) {
                return {
                    name: new_tag.toLowerCase()
                };
            };
            $scope.tag_exists = function(new_tag) {
                for (var i = 0; i < $scope.tags.length; i++)
                    if ($scope.tags[i].name == new_tag)
                        return true;
                return false;
            }
            $scope.insert_tag = function(tag) {
                if (tag !== '' && $rootScope.card_filter.tags.indexOf(tag) == -1) {
                    $rootScope.card_filter.tags.push({name: tag.toLowerCase()});
                    $scope.get_cards();
                }
                $scope.tag = '';
            }
            $scope.remove_tag = function(index) {
                $rootScope.card_filter.tags.splice(index, 1);
                $scope.get_cards();
            };

            $scope.$watchCollection('card_filter', function(newVal, oldVal) {
                $scope.get_cards();
            });
        }
    ]);

    app.controller('CardDetailCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$sce', 'Cards', 'Likes',
        function($scope, $rootScope, $routeParams, $http, $sce, Cards, Likes) {
            $scope.card_id = $routeParams.cardId;
            $scope.card;
            Cards.get({id: $scope.card_id}).$promise.then(function(response) {
                $scope.card = response;
                var image_slides = $scope.card.image_gallery.map(function(img) {
                    return {type: 'image', el: img};
                });
                var video_slides = $scope.card.youtube_embeds.map(function(video) {
                    return {type: 'video', el: video};
                });
                $scope.slides = image_slides.concat(video_slides);
            });

            $scope.toggle_like = function() {
                if ($scope.card.user_liked) {
                    Likes.delete({id: $scope.card.user_liked}).$promise.then(function() {
                        $scope.card.user_liked = null;
                        $scope.card.likes -= 1;
                    });
                }
                else {
                    Likes.save({card: $scope.card_id}).$promise.then(function(response) {
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
                        Cards.delete({id: $scope.card_id}).$promise.then(function(response) {
                            window.location.replace('#!/');
                        }).catch(function(error) {
                            $scope.error_messages.push('Não foi possível excluir a prática.');
                            console.error(error);
                        });
                    }
                }
            };

            /* Slider*/
            $scope.active_slide = 0;
            $scope.safe_url = function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);

    app.controller('NewCardCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$sce', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function($scope, $rootScope, $routeParams, $http, $sce, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card = {is_certified: false};
            $scope.card.audience = {};
            $scope.card.axis = {};
            $scope.card.image_gallery = [];
            $scope.card.youtube_embeds = [];
            $scope.slides = [];
            $scope.error_messages = [];
            $scope.editing_mode = false;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.tinymceOptions = TinymceOptions;

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
            $scope.tag_exists = function(new_tag) {
                for (var i = 0; i < $scope.tags.length; i++)
                    if ($scope.tags[i].name == new_tag)
                        return true;
                return false;
            }

            $scope.card.authors = [];
            $scope.add_author = function() {
                $scope.card.authors.push({author_name: '', author_description: ''});
            }

            /* Slider */
            $scope.mode = {
                ADD_MEDIA: 0,
                ADD_IMAGE: 1,
                ADD_VIDEO: 2,
                SHOW_MEDIA: 3
            };
            $scope.slide_mode = $scope.mode.ADD_MEDIA;
            $scope.dirty_slide = true;
            $scope.new_slide = function() {
                $scope.slide_mode = $scope.mode.ADD_MEDIA;
                $scope.dirty_slide = true;
            }

            function valid_card() {
                $scope.error_messages = [];
                if (!$scope.card.title || $scope.card.title == '')
                    $scope.error_messages.push('Título é campo obrigatório!');
                if (!$scope.card.audience || !$scope.card.audience.id || $scope.card.audience.id == '')
                    $scope.error_messages.push('Público é campo obrigatório!');
                if (!$scope.card.axis || !$scope.card.axis.id || $scope.card.axis.id == '')
                    $scope.error_messages.push('Eixo é campo obrigatório!');
                return $scope.error_messages.length == 0;
            }
            $scope.create_card = function() {
                if (valid_card()) {
                    $scope.card.image_gallery = $scope.slides.filter(function(media) {
                        return media.type == 'image';
                    }).map(function(media) {
                        return media.data;
                    });
                    $scope.card.youtube_embeds = $scope.slides.filter(function(media) {
                        return media.type == 'video';
                    }).map(function(media) {
                        return media.data;
                    });
                    $scope.card.tags = $scope.proxy.tags.map(function(tag) {
                        return tag.name;
                    });
                    Cards.save($scope.card).$promise.then(function(response) {
                        $scope.unsaved_content = false;
                        window.location.replace('#!/' + response.id);
                    }).catch(function(error) {
                        $scope.error_messages.push('Não foi possível criar a prática.');
                        console.error(error);
                    });
                }
            }

            /* Images */
            $scope.upload_image = function(file) {
                if (file) {
                    Images.upload(file, '').then(function(response) {
                        var last_image = -1;
                        for (var i = 0; i < $scope.slides.length; i++) {
                            if ($scope.slides[i].type == 'image')
                                last_image = i;
                            else
                                break;
                        }
                        $scope.slides.splice(last_image + 1, 0, {
                            type: 'image',
                            data: response.data
                        });
                        $scope.selected_slide_index = last_image + 1;
                        $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                        $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                        $scope.dirty_slide = false;
                    }).catch(function(error) {
                        $scope.error_messages.push('Não foi possível salvar a imagem.');
                        console.error(error);
                    });
                }
            };
            function remove_image(index) {
                if (window.confirm('Deseja mesmo excluir essa imagem?'))
                    return Images.delete({id: $scope.slides[index].data.id}).$promise;
            }

            /* Videos */
            $scope.embed_video = function() {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11) {
                    youtube_id = result[2];
                }
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function(response) {
                    $scope.slides.push({
                        type: 'video',
                        data: response
                    });
                    $scope.selected_slide_index = $scope.slides.length - 1;
                    $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                    $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                    $scope.dirty_slide = false;
                    $scope.video_url = '';
                }).catch(function(error) {
                    $scope.error_messages.push('Não foi possível salvar o vídeo.');
                    console.error(error);
                });
            };
            function remove_video(index) {
                if (window.confirm('Deseja mesmo excluir esse vídeo?'))
                    return YouTubeEmbeds.delete({id: $scope.slides[index].data.id}).$promise;
            };

            /* Media - Generic */
            $scope.select_media = function(index) {
                $scope.selected_slide_index = index;
                $scope.selected_slide = $scope.slides[index];
                $scope.slide_mode = $scope.mode.SHOW_MEDIA;
            };
            $scope.remove_media = function(index) {
                var media_type, promise;
                if ($scope.slides[index].type == 'image') {
                    media_type = 'image';
                    promise = remove_image(index);
                }
                else if ($scope.slides[index].type == 'video') {
                    media_type = 'video';
                    promise = remove_video(index);
                }
                promise.then(function() { /* Media was successfully removed. */
                    $scope.slides.splice(index, 1);
                    if ($scope.slides.length == index) { /* We removed the last-index slide */
                        if (index == 0) { /* No more slides remaining */
                            $scope.slide_mode = $scope.mode.ADD_MEDIA;
                            $scope.dirty_slide = true;
                        }
                        else {
                            $scope.selected_slide_index = $scope.slides.length - 1;
                            $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                        }
                    }
                    else {
                        $scope.selected_slide_index = index;
                        $scope.selected_slide = $scope.slides[index];
                    }
                }, function(error) { /* Media removal failed. */
                    if (media_type == 'image')
                        $scope.error_messages.push('Não foi possível excluir a imagem.');
                    else if (media_type == 'video')
                        $scope.error_messages.push('Não foi possível excluir o vídeo.');
                    console.error(error);
                });
            };
            $scope.is_selected_media = function(index) {
                if ($scope.selected_slide_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            /* Tracking unsaved changes. */
            $scope.changed_once = false; /* Guard: $scope.card is implicitly changed once. */
            $scope.$on('$locationChangeStart', function(e) {
                if ($scope.unsaved_content)
                    if (!window.confirm('Há alterações não salvas. Deseja mesmo sair?'))
                        e.preventDefault();
            });
            $scope.$watchCollection('card', function(newVal, oldVal) {
                if ($scope.changed_once)
                    $scope.unsaved_content = true;
                else
                    $scope.changed_once = true;
            });
            $scope.unsaved_content = false;

            $scope.safe_url = function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);

    app.controller('EditCardCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$sce', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function($scope, $rootScope, $routeParams, $http, $sce, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card_id = $routeParams.cardId;
            $scope.slides = [];

            Cards.get({id: $scope.card_id}).$promise.then(function(response) {
                $scope.card = response;
                $scope.proxy = {};
                $scope.proxy.tags = $scope.card.tags;
                var image_slides = $scope.card.image_gallery.map(function(img) {
                    return {type: 'image', data: img};
                });
                var video_slides = $scope.card.youtube_embeds.map(function(vid) {
                    return {type: 'video', data: vid};
                });
                $scope.slides = image_slides.concat(video_slides);
                if ($scope.slides.length > 0) {
                    $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                    $scope.dirty_slide = false;
                    $scope.selected_slide = $scope.slides[0];
                    $scope.selected_slide_index = 0;
                }
                else {
                    $scope.slide_mode = $scope.mode.ADD_MEDIA;
                    $scope.dirty_slide = true;
                }

                /* Tracking unsaved changes. */
                $scope.changed_once = false; /* Guard: $scope.card is implicitly changed once. */
                $scope.$on('$locationChangeStart', function(e) {
                    if ($scope.unsaved_content)
                        if (!window.confirm('Há alterações não salvas. Deseja mesmo sair?'))
                            e.preventDefault();
                });
                $scope.$watchCollection('card', function(newVal, oldVal) {
                    if ($scope.changed_once)
                        $scope.unsaved_content = true;
                    else
                        $scope.changed_once = true;
                });
                $scope.unsaved_content = false;
            });
            $scope.error_messages = [];
            $scope.editing_mode = true;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.tinymceOptions = TinymceOptions;

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
            $scope.tag_exists = function(new_tag) {
                for (var i = 0; i < $scope.tags.length; i++)
                    if ($scope.tags[i].name == new_tag)
                        return true;
                return false;
            }

            function valid_card() {
                $scope.error_messages = [];
                if (!$scope.card.title || $scope.card.title == '')
                    $scope.error_messages.push('Título é campo obrigatório!');
                if (!$scope.card.audience || !$scope.card.audience.id || $scope.card.audience.id == '')
                    $scope.error_messages.push('Público é campo obrigatório!');
                if (!$scope.card.axis || !$scope.card.axis.id || $scope.card.axis.id == '')
                    $scope.error_messages.push('Eixo é campo obrigatório!');
                return $scope.error_messages.length == 0;
            }
            $scope.update_card = function() {
                if ($scope.card.editable && valid_card()) {
                    $scope.card.id = $scope.card_id;
                    $scope.card.image_gallery = $scope.slides.filter(function(media) {
                        return media.type == 'image';
                    }).map(function(media) {
                        return media.data;
                    });
                    $scope.card.youtube_embeds = $scope.slides.filter(function(media) {
                        return media.type == 'video';
                    }).map(function(media) {
                        return media.data;
                    });
                    $scope.card.tags = $scope.proxy.tags.map(function(tag) {
                        return tag.name;
                    });
                    Cards.update($scope.card).$promise.then(function(response) {
                        $scope.unsaved_content = false;
                        window.location.replace('#!/' + $scope.card_id);
                    }).catch(function(error) {
                        $scope.error_messages('Não foi possível atualizar a prática.');
                        console.error(error);
                    });
                }
            }

            $scope.delete_card = function() {
                if (window.confirm('Deseja mesmo excluir essa prática?')) {
                    if ($scope.card.editable) {
                        Cards.delete({id: $scope.card_id}).$promise.then(function(response) {
                            window.location.replace('#!/');
                        }).catch(function(error) {
                            $scope.error_messages.push('Não foi possível remover a prática.');
                            console.error(error);
                        });
                    }
                }
            };

            $scope.add_author = function() {
                $scope.card.authors.push({author_name: '', author_description: ''});
            }

            /* Slider */
            $scope.mode = {
                ADD_MEDIA: 0,
                ADD_IMAGE: 1,
                ADD_VIDEO: 2,
                SHOW_MEDIA: 3
            };
            $scope.new_slide = function() {
                $scope.slide_mode = $scope.mode.ADD_MEDIA;
                $scope.dirty_slide = true;
            }

            /* Images */
            $scope.upload_image = function(file) {
                if (file) {
                    Images.upload(file, '').then(function(response) {
                        var last_image = -1;
                        for (var i = 0; i < $scope.slides.length; i++) {
                            if ($scope.slides[i].type == 'image')
                                last_image = i;
                            else
                                break;
                        }
                        $scope.slides.splice(last_image + 1, 0, {
                            type: 'image',
                            data: response.data
                        });
                        $scope.selected_slide_index = last_image + 1;
                        $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                        $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                        $scope.dirty_slide = false;
                    }).catch(function(error) {
                        $scope.error_messages.push('Não foi possível salvar a imagem.');
                        console.error(error);
                    });
                }
            };
            function remove_image(index) {
                if (window.confirm('Deseja mesmo excluir essa imagem?'))
                    return Images.delete({id: $scope.slides[index].data.id}).$promise;
            }

            /* Videos */
            $scope.embed_video = function() {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11) {
                    youtube_id = result[2];
                }
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function(response) {
                    $scope.slides.push({
                        type: 'video',
                        data: response
                    });
                    $scope.selected_slide_index = $scope.slides.length - 1;
                    $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                    $scope.slide_mode = $scope.mode.SHOW_MEDIA;
                    $scope.dirty_slide = false;
                    $scope.video_url = '';
                }).catch(function(error) {
                    $scope.error_messages.push('Não foi possível salvar o vídeo.');
                    console.error(error);
                });
            };
            function remove_video(index) {
                if (window.confirm('Deseja mesmo excluir esse vídeo?'))
                    return YouTubeEmbeds.delete({id: $scope.slides[index].data.id}).$promise;
            };

            /* Media - Generic */
            $scope.select_media = function(index) {
                $scope.selected_slide_index = index;
                $scope.selected_slide = $scope.slides[index];
                $scope.slide_mode = $scope.mode.SHOW_MEDIA;
            };
            $scope.remove_media = function(index) {
                var media_type, promise;
                if ($scope.slides[index].type == 'image') {
                    media_type = 'image';
                    promise = remove_image(index);
                }
                else if ($scope.slides[index].type == 'video') {
                    media_type = 'video';
                    promise = remove_video(index);
                }
                promise.then(function() { /* Media was successfully removed. */
                    $scope.slides.splice(index, 1);
                    if ($scope.slides.length == index) { /* We removed the last-index slide */
                        if (index == 0) { /* No more slides remaining */
                            $scope.slide_mode = $scope.mode.ADD_MEDIA;
                            $scope.dirty_slide = true;
                        }
                        else {
                            $scope.selected_slide_index = $scope.slides.length - 1;
                            $scope.selected_slide = $scope.slides[$scope.selected_slide_index];
                        }
                    }
                    else {
                        $scope.selected_slide_index = index;
                        $scope.selected_slide = $scope.slides[index];
                    }
                }, function(error) { /* Media removal failed. */
                    if (media_type == 'image')
                        $scope.error_messages.push('Não foi possível excluir a imagem.');
                    else if (media_type == 'video')
                        $scope.error_messages.push('Não foi possível excluir o vídeo.');
                    console.error(error);
                });
            };
            $scope.is_selected_media = function(index) {
                if ($scope.selected_slide_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            $scope.safe_url = function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);

})(window.angular);
