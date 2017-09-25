(function(angular){
    'use strict';
    var app = angular.module('cards.controllers', ['ngCookies']);

    app.controller('CardsListCtrl', ['$scope', '$routeParams', '$http', 'Audiences', 'Axes', 'Cards', 'Likes', 'Tags', 'YouTubeEmbeds',
        function($scope, $routeParams, $http, Audiences, Axes, Cards, Likes, Tags, YouTubeEmbeds) {

            /* Services bindings */
            $scope.audiences = Audiences.query();
            $scope.cards = {};
            $scope.cards.all = Cards.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.show_filter_options = false;
            $scope.keyword = '';
            $scope.filter = {};
            $scope.filter.keyword = '';
            $scope.filter.audience = '';
            $scope.filter.axis = '';
            $scope.filter.status = '';
            $scope.filter.tags = [];

            /* Because modulo operation is **very wrongly** defined in JS for negative numbers. */
            function safe_mod(m, n) {
                return ((m % n) + n) % n;
            }

            function get_slides_row(arr, start) {
                if (arr.length < 3)
                    return arr;
                var new_row = [];
                for (let i = 0; i < 3; i++)
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
                $scope.filter.keyword = $scope.keyword;
                $scope.blank_filters =
                    $scope.filter.keyword === '' &&
                    $scope.filter.audience === '' &&
                    $scope.filter.axis === '' &&
                    $scope.filter.status === '' &&
                    $scope.filter.tags.length === 0;
                Cards.query({
                    audience__name: $scope.filter.audience,
                    axis__name: $scope.filter.axis,
                    is_certified: $scope.filter.status,
                    search: $scope.filter.keyword,
                    tags__name: $scope.filter.tags
                }).$promise.then(function(data) {
                    $scope.cards.all = data;
                    filter_by_status();
                    $scope.certified_base_slide = 0;
                    $scope.community_base_slide = 0;
                    $scope.slider.certified = get_slides_row($scope.cards.certified, $scope.certified_base_slide);
                    $scope.slider.community = get_slides_row($scope.cards.community, $scope.community_base_slide); 
                });
            };

            /* Tags */
            $scope.tag = '';
            $scope.insert_tag = function(tag) {
                if (tag !== '' && $scope.filter.tags.indexOf(tag) == -1) {
                    $scope.filter.tags.push(tag.toLowerCase());
                    $scope.get_cards();
                }
                $scope.tag = '';                
            };
            $scope.remove_tag = function(index) {
                $scope.filter.tags.splice(index, 1);
                $scope.get_cards();
            };

            /* Search routing */
            {
                var additional_params = false;
                if ($routeParams.tag) {
                    $scope.filter.tags.push($routeParams.tag);
                    additional_params = true;
                }
                else if ($routeParams.audience) {
                    $scope.filter.audience = $routeParams.audience;
                    additional_params = true;
                }
                else if ($routeParams.axis) {
                    $scope.filter.axis = $routeParams.axis;
                    additional_params = true;
                }

                if (additional_params) {
                    console.log("Teste")
                    $scope.get_cards();
                }
            }

            $scope.cards.all.$promise.then(function() {
                filter_by_status();
                $scope.slider.certified = get_slides_row($scope.cards.certified, 0);
                $scope.slider.community = get_slides_row($scope.cards.community, 0);
            });    
            
            $scope.$watchCollection('filter', function(newVal, oldVal) {
                $scope.get_cards();
            });
        }
    ]);

    app.controller('CardDetailCtrl', ['$scope', '$routeParams', '$http', '$sce', 'Cards', 'Likes',
        function($scope, $routeParams, $http, $sce, Cards, Likes) {
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

            $scope.delete_card = function() {
                if (window.confirm("Deseja mesmo excluir essa prática?")) {
                    if ($scope.card.editable) {
                        Cards.delete({id: $scope.card_id}).$promise.then(function(response) {
                            window.location.replace('#!/');
                        }).catch(function(error) {
                            console.log(error);
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

    app.controller('NewCardCtrl', ['$scope', '$routeParams', '$http', '$sce', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function($scope, $routeParams, $http, $sce, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card = {is_certified: false};
            $scope.card.audience = {};
            $scope.card.axis = {};
            $scope.card.image_gallery = [];
            $scope.card.youtube_embeds = [];
            $scope.validation_errors = [];
            $scope.editing_mode = false;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.tinymceOptions = TinymceOptions;

            $scope.card.tags = [];
            $scope.new_tag = function(new_tag) {
                return {
                    name: new_tag.toLowerCase()
                };
            };

            $scope.card.authors = [];
            $scope.add_author = function() {
                $scope.card.authors.push({author_name: '', author_description: ''});
            }

            function valid_card() {
                $scope.validation_errors = [];
                if (!$scope.card.title || $scope.card.title == '')
                    $scope.validation_errors.push('Título é campo obrigatório!');
                if (!$scope.card.audience || !$scope.card.audience.id || $scope.card.audience.id == '')
                    $scope.validation_errors.push('Público é campo obrigatório!');
                if (!$scope.card.axis || !$scope.card.axis.id || $scope.card.axis.id == '')
                    $scope.validation_errors.push('Eixo é campo obrigatório!');
                return $scope.validation_errors.length == 0;
            }
            $scope.create_card = function() {
                if (valid_card()) {
                    $scope.card.tags = $scope.card.tags.map(function(tag) {
                        return tag.name;
                    });
                    Cards.save($scope.card).$promise.then(function(response) {
                        $scope.unsaved_content = false;
                        window.location.replace('#!/' + response.id);
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            }

            /* Slider */
            $scope.mode = {
                ADD_MEDIA: 0,
                ADD_IMAGE: 1,
                ADD_VIDEO: 2,
                SHOW_IMAGE: 3,
                SHOW_VIDEO: 4
            };
            $scope.slide_mode = $scope.mode.ADD_MEDIA;
            $scope.new_slide_index = function() {
                var new_index = 1;
                if ($scope.card.image_gallery && $scope.card.image_gallery.length > 0)
                    new_index += $scope.card.image_gallery.length;
                if ($scope.card.youtube_embeds && $scope.card.youtube_embeds.length > 0)
                    new_index += $scope.card.youtube_embeds.length;
                return new_index;
            }

            /* Images */
            $scope.upload_image = function(file) {
                if (file) {
                    Images.upload(file, '').then(function(response) {
                        $scope.card.image_gallery.push(response.data);
                        $scope.selected_image = response.data;
                        $scope.selected_image_index = $scope.card.image_gallery.length - 1;
                        $scope.slide_mode = $scope.mode.SHOW_IMAGE;
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            };
            $scope.select_image = function(index) {
                $scope.selected_image = $scope.card.image_gallery[index];
                $scope.selected_image_index = index;
                $scope.slide_mode = $scope.mode.SHOW_IMAGE;
            };
            $scope.remove_image = function(index) {
                if (window.confirm("Deseja mesmo excluir essa imagem?")) {
                    Images.delete({id: $scope.card.image_gallery[index].id}).$promise.then(function() {
                        $scope.card.image_gallery.splice(index, 1);
                        $scope.slide_mode = $scope.mode.ADD_MEDIA;
                    }).catch(function(error){
                        console.log(error);
                    });
                }
            };
            $scope.is_selected_image = function(index) {
                if ($scope.slide_mode == $scope.mode.SHOW_IMAGE && $scope.selected_image_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            /* Videos */
            $scope.embed_video = function() {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; 
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11){
                    youtube_id = result[2];
                }
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function(response) {
                    $scope.card.youtube_embeds.push(response);
                    $scope.video_url = '';
                    $scope.selected_video = response;
                    $scope.selected_video_index = $scope.card.youtube_embeds.length - 1;
                    $scope.slide_mode = $scope.mode.SHOW_VIDEO;
                }).catch(function(error) {
                    console.log(error);
                });
            }
            $scope.select_video = function(index) {
                $scope.selected_video = $scope.card.youtube_embeds[index];
                $scope.selected_video_index = index;
                $scope.slide_mode = $scope.mode.SHOW_VIDEO;
            };
            $scope.remove_video = function(index) {
                if (window.confirm("Deseja mesmo excluir esse vídeo?")) {
                    YouTubeEmbeds.delete({id: $scope.card.youtube_embeds[index].id}).$promise.then(function() {
                        $scope.card.youtube_embeds.splice(index, 1);
                        $scope.slide_mode = $scope.mode.ADD_MEDIA;
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            };
            $scope.is_selected_video = function(index) {
                if ($scope.slide_mode == $scope.mode.SHOW_VIDEO && $scope.selected_video_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            /* Tracking unsaved changes. */
            $scope.changed_once = false; /* Guard: $scope.card is implicitly changed once. */
            $scope.$on('$locationChangeStart', function(e) {
                console.log($scope.unsaved_content)
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

    app.controller('EditCardCtrl', ['$scope', '$routeParams', '$http', '$sce', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function($scope, $routeParams, $http, $sce, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card_id = $routeParams.cardId;

            Cards.get({id: $scope.card_id}).$promise.then(function(response) {
                $scope.card = response;
                $scope.new_slide_index = function() {
                    var new_index = 1;
                    if ($scope.card.image_gallery && $scope.card.image_gallery.length > 0)
                        new_index += $scope.card.image_gallery.length;
                    if ($scope.card.youtube_embeds && $scope.card.youtube_embeds.length > 0)
                        new_index += $scope.card.youtube_embeds.length;
                    return new_index;
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
            $scope.validation_errors = [];
            $scope.editing_mode = true;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.new_tag = function(new_tag) {
                return {
                    name: new_tag
                };
            };

            function valid_card() {
                $scope.validation_errors = [];
                if (!$scope.card.title || $scope.card.title == '')
                    $scope.validation_errors.push('Título é campo obrigatório!');
                if (!$scope.card.audience || !$scope.card.audience.id || $scope.card.audience.id == '')
                    $scope.validation_errors.push('Público é campo obrigatório!');
                if (!$scope.card.axis || !$scope.card.axis.id || $scope.card.axis.id == '')
                    $scope.validation_errors.push('Eixo é campo obrigatório!');
                return $scope.validation_errors.length == 0;
            }
            $scope.update_card = function() {
                if ($scope.card.editable && valid_card()) {
                    $scope.card.id = $scope.card_id;
                    $scope.backup_tags = $scope.card.tags;
                    $scope.card.tags = $scope.card.tags.map(function(tag) {
                        return tag.name;
                    });
                    Cards.update($scope.card).$promise.then(function(response) {
                        $scope.unsaved_content = false;
                        window.location.replace('#!/' + $scope.card_id);
                    }).catch(function(error) {
                        $scope.card.tags = $scope.backup_tags;
                        console.log(error);
                    });
                }
            }

            $scope.delete_card = function() {
                if (window.confirm("Deseja mesmo excluir essa prática?")) {
                    if ($scope.card.editable) {
                        Cards.delete({id: $scope.card_id}).$promise.then(function(response) {
                            window.location.replace('#!/');
                        }).catch(function(error) {
                            console.log(error);
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
                SHOW_IMAGE: 3,
                SHOW_VIDEO: 4
            };
            $scope.slide_mode = $scope.mode.ADD_MEDIA;
            $scope.new_slide_index = function() {
                return 1; /* Overwritten on card retrival. */
            }

            /* Images */
            $scope.upload_image = function(file) {
                if (file) {
                    Images.upload(file, '').then(function(response) {
                        $scope.card.image_gallery.push(response.data);
                        $scope.selected_image = response.data;
                        $scope.selected_image_index = $scope.card.image_gallery.length - 1;
                        $scope.slide_mode = $scope.mode.SHOW_IMAGE;
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            };
            $scope.select_image = function(index) {
                $scope.selected_image = $scope.card.image_gallery[index];
                $scope.selected_image_index = index;
                $scope.slide_mode = $scope.mode.SHOW_IMAGE;
            };
            $scope.remove_image = function(index) {
                if (window.confirm("Deseja mesmo excluir essa imagem?")) {
                    Images.delete({id: $scope.card.image_gallery[index].id}).$promise.then(function() {
                        $scope.card.image_gallery.splice(index, 1);
                        $scope.slide_mode = $scope.mode.ADD_MEDIA;
                    }).catch(function(error){
                        console.log(error);
                    });
                }
            };
            $scope.is_selected_image = function(index) {
                if ($scope.slide_mode == $scope.mode.SHOW_IMAGE && $scope.selected_image_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            /* Videos */
            $scope.embed_video = function() {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; 
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11){
                    youtube_id = result[2];
                }
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function(response) {
                    $scope.card.youtube_embeds.push(response);
                    $scope.video_url = '';
                    $scope.selected_video = response;
                    $scope.selected_video_index = $scope.card.youtube_embeds.length - 1;
                    $scope.slide_mode = $scope.mode.SHOW_VIDEO;
                }).catch(function(error) {
                    console.log(error);
                });
            }
            $scope.select_video = function(index) {
                $scope.selected_video = $scope.card.youtube_embeds[index];
                $scope.selected_video_index = index;
                $scope.slide_mode = $scope.mode.SHOW_VIDEO;
            };
            $scope.remove_video = function(index) {
                if (window.confirm("Deseja mesmo excluir esse vídeo?")) {
                    YouTubeEmbeds.delete({id: $scope.card.youtube_embeds[index].id}).$promise.then(function() {
                        $scope.card.youtube_embeds.splice(index, 1);
                        $scope.slide_mode = $scope.mode.ADD_MEDIA;
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            };
            $scope.is_selected_video = function(index) {
                if ($scope.slide_mode == $scope.mode.SHOW_VIDEO && $scope.selected_video_index == index)
                    return 'btn-primary';
                return 'btn-default';
            };

            $scope.safe_url = function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]);

})(window.angular);
