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

            $scope.blank_filters = true;

            $scope.query = function () {
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
                });
            };

            /* Tags */
            $scope.tag = '';
            if ($routeParams.tag) {
                $scope.filter.tags.push($routeParams.tag);
                $scope.query();
            } 
            $scope.insert_tag = function (tag) {
                if (tag !== '' && $scope.filter.tags.indexOf(tag) == -1) {
                    $scope.filter.tags.push(tag);
                    $scope.query();
                }
                $scope.tag = '';                
            };
            $scope.remove_tag = function (index) {
                $scope.filter.tags.splice(index, 1);
                $scope.query();
            };

            $scope.cards.all.$promise.then(filter_by_status);    
            
            $scope.$watchCollection('filter', function(newVal, oldVal) {
                $scope.query();
            });
        }
    ]);

    app.controller('CardDetailCtrl', ['$scope', '$routeParams', '$http', 'Cards', 'Likes', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Cards, Likes, YouTubeEmbeds) {
            $scope.card_id = $routeParams.cardId; 
            $scope.card = Cards.get({id: $scope.card_id});
            $scope.card.$promise.then(console.log($scope.card));
            
            // $scope.is_empty = function (obj){
            //     return obj && Object.keys(obj).length === 0;
            // };

            $scope.like = function () {
                Likes.save({card: $scope.card_id}).$promise.then(function(response) {
                    $scope.card.user_liked = response.pk;
                    $scope.card.likes += 1;
                });
            };
            $scope.unlike = function () {
                Likes.delete({id: $scope.card.user_liked}).$promise.then(function() {
                    $scope.card.user_liked = null;
                    $scope.card.likes -= 1;
                });
            };
        }
    ]); 

    app.controller('NewCardCtrl', ['$scope', '$routeParams', '$http', 'Cards', 'Likes', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Cards, Likes, YouTubeEmbeds) {
            // Cards.save({
            //     audience: {
            //         pk: 3
            //     },
            //     axis: {
            //         pk: 2
            //     },
            //     is_certified: false,
            //     tags: ['estações', 'outono'],
            //     text: 'A estação da renovação!',
            //     title: 'É assim que se curte o outono'
            //     }).$promise.then(function (data) {
            //     console.log(data);
            //     console.log("Sucesso!");
            //     }).catch(function (error) {
            //     console.log(error);
            // });
        }
    ]);

})(window.angular);
