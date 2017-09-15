(function(angular){
    'use strict';
    var app = angular.module('cards.controllers', ['ngCookies']);

    app.controller('CardsListCtrl', ['$scope', '$routeParams', '$http', 'Audiences', 'Axes', 'Cards', 'Likes', 'Tags', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Audiences, Axes, Cards, Likes, Tags, YouTubeEmbeds) {

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
            function safe_mod (m, n) {
                return ((m % n) + n) % n;
            }

            function get_slides_row (arr, start) {
                if (arr.length < 3)
                    return arr;
                var new_row = [];
                for (let i = 0; i < 3; i++)
                    new_row[i] = arr[safe_mod(i + start, arr.length)];
                return new_row;
            }

            $scope.certified_base_slide = 0;
            $scope.community_base_slide = 0;
            $scope.certified_slides_down = function () {
                $scope.slider.certified = get_slides_row($scope.cards.certified, --$scope.certified_base_slide);  
            }
            $scope.certified_slides_up = function () {
                $scope.slider.certified = get_slides_row($scope.cards.certified, ++$scope.certified_base_slide);
            }
            $scope.community_slides_down = function () {
                $scope.slider.community = get_slides_row($scope.cards.community, --$scope.community_base_slide);
            }
            $scope.community_slides_up = function () {
                $scope.slider.community = get_slides_row($scope.cards.community, ++$scope.community_base_slide);
            }

            function filter_by_status () {
                $scope.cards.certified = $scope.cards.all.slice(0).
                    filter(function (elem) {
                        return elem.is_certified;
                    });
                $scope.cards.community = $scope.cards.all.slice(0).
                    filter(function (elem) {
                        return !elem.is_certified;
                    });
            }

            $scope.slider = {};          

            $scope.blank_filters = true;

            $scope.get_cards = function () {
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
                }).$promise.then(function (data) {
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
            if ($routeParams.tag) {
                $scope.filter.tags.push($routeParams.tag);
                $scope.get_cards();
            } 
            $scope.insert_tag = function (tag) {
                if (tag !== '' && $scope.filter.tags.indexOf(tag) == -1) {
                    $scope.filter.tags.push(tag);
                    $scope.get_cards();
                }
                $scope.tag = '';                
            };
            $scope.remove_tag = function (index) {
                $scope.filter.tags.splice(index, 1);
                $scope.get_cards();
            };

            $scope.cards.all.$promise.then(function () {
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
        function ($scope, $routeParams, $http, $sce, Cards, Likes) {
            $scope.card_id = $routeParams.cardId; 
            $scope.card;
            Cards.get({id: $scope.card_id}).$promise.then(function (response) {
                $scope.card = response;
                var image_slides = $scope.card.image_gallery.map(function (img) {
                    return {type: 'image', el: img};
                });
                var video_slides = $scope.card.youtube_embeds.map(function (video) {
                    return {type: 'video', el: video};
                });
                $scope.slides = image_slides.concat(video_slides);
            });

            $scope.like = function () {
                Likes.save({card: $scope.card_id}).$promise.then(function(response) {
                    $scope.card.user_liked = response.id;
                    $scope.card.likes += 1;
                });
            };
            $scope.unlike = function () {
                Likes.delete({id: $scope.card.user_liked}).$promise.then(function() {
                    $scope.card.user_liked = null;
                    $scope.card.likes -= 1;
                });
            };

            $scope.delete_card = function () {
                if ($scope.card.editable) {
                    Cards.delete({id: $scope.card_id}).$promise.then(function (response) {
                        window.location.replace('#!/');
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            };

            /* Slider*/
            $scope.active_slide = 0;
            $scope.safe_url = function (url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ]); 

    app.controller('NewCardCtrl', ['$scope', '$routeParams', '$http', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card = {is_certified: false};
            $scope.card.audience = {};
            $scope.card.axis = {};
            $scope.card.image_gallery = [];
            $scope.card.youtube_embeds = [];
            $scope.editing_mode = false;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.tinymceOptions = TinymceOptions;

            $scope.card.tags = [];
            $scope.new_tag = function (new_tag) {
                return {
                    name: new_tag
                };
            };

            $scope.card.authors = [];
            $scope.add_author = function () {
                $scope.card.authors.push({author_name: '', author_description: ''});
            }

            function valid_card() {
                var error = $scope.card.title && $scope.card.title != '' &&
                $scope.card.audience && $scope.card.audience.id != '' &&
                $scope.card.axis && $scope.card.axis.id != '';
                return error;
            }
            $scope.create_card = function () {
                if (valid_card()) {
                    $scope.card.tags = $scope.card.tags.map(function (tag) {
                        return tag.name;
                    });
                    Cards.save($scope.card).$promise.then(function (response) {
                        window.location.replace('#!/' + response.id);
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            }

            function unselect_image() {
                $scope.selected_image = null;
                $scope.selected_image_index = -1;
            }
            function unselect_video() {
                $scope.selected_video = null;
                $scope.selected_video_index = -1;
            }

            unselect_image();
            $scope.upload_image = function (file) {
                if (file) {
                    Images.upload(file, '').then(function (response) {
                        $scope.card.image_gallery.push(response.data);
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            };
            $scope.select_image = function (index) {
                $scope.selected_image = $scope.card.image_gallery[index];
                $scope.selected_image_index = index;
                unselect_video();
            };
            $scope.remove_image = function (index) {
                Images.delete({id: $scope.card.image_gallery[index].id}).$promise.then(function () {
                    $scope.card.image_gallery.splice(index, 1);
                    unselect_image();
                }).catch(function (error){
                    console.log(error);
                });
            };

            unselect_video();
            $scope.embed_video = function () {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; 
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11){
                    youtube_id = result[2];
                }
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function (response) {
                    $scope.card.youtube_embeds.push(response);
                }).catch(function (error) {
                    console.log(error);
                });
            }
            $scope.select_video = function (index) {
                $scope.selected_video = $scope.card.youtube_embeds[index];
                $scope.selected_video_index = index;
                unselect_image();
            };
            $scope.remove_video = function (index) {
                YouTubeEmbeds.delete({id: $scope.card.youtube_embeds[index].id}).$promise.then(function () {
                    $scope.card.youtube_embeds.splice(index, 1);
                    unselect_video();
                }).catch(function (error) {
                    console.log(error);
                });
            };
        }
    ]);

    app.controller('EditCardCtrl', ['$scope', '$routeParams', '$http', 'Audiences', 'Axes', 'Cards', 'Images', 'Likes', 'Tags', 'TinymceOptions', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Audiences, Axes, Cards, Images, Likes, Tags, TinymceOptions, YouTubeEmbeds) {
            $scope.card_id = $routeParams.cardId;
            $scope.card = Cards.get({id: $scope.card_id});
            $scope.editing_mode = true;

            $scope.audiences = Audiences.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            function valid_card() {
                var error = $scope.card.title && $scope.card.title != '' &&
                $scope.card.audience && $scope.card.audience.id != '' &&
                $scope.card.axis && $scope.card.axis.id != '';
                return error;
            }
            $scope.update_card = function () {
                if ($scope.card.editable && valid_card()) {
                    $scope.card.id = $scope.card_id;
                    $scope.backup_tags = $scope.card.tags;
                    $scope.card.tags = $scope.card.tags.map(function (tag) {
                        return tag.name;
                    });
                    Cards.update($scope.card).$promise.then(function (response) {
                        window.location.replace('#!/' + $scope.card_id);
                    }).catch(function (error) {
                        $scope.card.tags = $scope.backup_tags;
                        console.log(error);
                    });
                }
            }

            $scope.delete_card = function () {
                if ($scope.card.editable) {
                    Cards.delete({id: $scope.card_id}).$promise.then(function (response) {
                        window.location.replace('#!/');
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            };

            $scope.add_author = function () {
                $scope.card.authors.push({author_name: '', author_description: ''});
            }

            function unselect_image() {
                $scope.selected_image = null;
                $scope.selected_image_index = -1;
            }
            function unselect_video() {
                $scope.selected_video = null;
                $scope.selected_video_index = -1;
            }

            unselect_image();
            $scope.upload_image = function (file) {
                if (file) {
                    Images.upload(file, '').then(function (response) {
                        $scope.card.image_gallery.push(response.data);
                    }).catch(function (error) {
                        console.log(error);
                    });
                }
            };
            $scope.select_image = function (index) {
                $scope.selected_image = $scope.card.image_gallery[index];
                $scope.selected_image_index = index;
                unselect_video();
            };
            $scope.remove_image = function (index) {
                Images.delete({id: $scope.card.image_gallery[index].id}).$promise.then(function () {
                    $scope.card.image_gallery.splice(index, 1);
                    unselect_image();
                }).catch(function (error){
                    console.log(error);
                });
            };

            unselect_video();
            $scope.embed_video = function () {
                var youtube_pattern = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; 
                var result = youtube_pattern.exec($scope.video_url);
                $scope.video_url = '';
                var youtube_id;
                if (result && result[2].length == 11){
                    youtube_id = result[2];
                }        
                YouTubeEmbeds.save({video_id: youtube_id}).$promise.then(function (response) {
                    $scope.card.youtube_embeds.push(response);
                }).catch(function (error) {
                    console.log(error);
                });
            }
            $scope.select_video = function (index) {
                $scope.selected_video = $scope.card.youtube_embeds[index];
                $scope.selected_video_index = index;
                unselect_image();
            };
            $scope.remove_video = function (index) {
                YouTubeEmbeds.delete({id: $scope.card.youtube_embeds[index].id}).$promise.then(function () {
                    $scope.card.youtube_embeds.splice(index, 1);
                    unselect_video();
                }).catch(function (error) {
                    console.log(error);
                });
            };
        }
    ]);

})(window.angular);
