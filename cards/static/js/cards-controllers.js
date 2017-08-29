(function(angular){
    'use strict';
    var app = angular.module('cards.controllers', ['ngCookies']);

    app.controller('CardsListCtrl', ['$scope', '$routeParams', '$http', 'Audiences', 'Axes', 'Cards', 'Likes', 'Tags', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Audiences, Axes, Cards, Likes, Tags, YouTubeEmbeds) {
            /* Services bindings */
            $scope.audiences = Audiences.query();
            $scope.cards = Cards.query();
            $scope.axes = Axes.query();
            $scope.tags = Tags.query();

            $scope.show_filter_options = false;
            $scope.keyword = '';
            $scope.selected_audience = '';
            $scope.selected_axis = '';
            $scope.selected_status = '';
            $scope.selected_tags = [];

            $scope.last_searched = '';

            function filter_by_status () {
                $scope.certified_cards = $scope.cards.slice(0).
                    filter(function (elem) {
                        return elem.is_certified;
                    });
                $scope.unattached_cards = $scope.cards.slice(0).
                    filter(function (elem) {
                        return !elem.is_certified;
                    });
            }

            $scope.filtered_query = function () {             
                Cards.query({
                    audience__name: $scope.selected_audience,
                    axis__name: $scope.selected_axis,
                    is_certified: $scope.selected_status,
                    search: $scope.keyword,
                    tags__name: $scope.selected_tags
                }).$promise.then(function (data) {
                    console.log(data);
                    $scope.cards = data;
                    filter_by_status();
                });
            }

            $scope.search_keyword = function() {
                $scope.last_searched = $scope.keyword;
                $scope.cards = Cards.query({search: $scope.keyword});
                $scope.cards.$promise.then(filter_by_status);
            }

            $scope.cards.$promise.then(filter_by_status);          
        }
    ]);

    app.controller('CardDetailCtrl', ['$scope', '$routeParams', '$http', 'Cards', 'Likes', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Cards, Likes, YouTubeEmbeds) {
            $scope.card_id = $routeParams.cardId; 
            $scope.card = Cards.get({id: $scope.card_id});
        }
    ]); 

    app.controller('NewCardCtrl', ['$scope', '$routeParams', '$http', 'Cards', 'Likes', 'YouTubeEmbeds',
        function ($scope, $routeParams, $http, Cards, Likes, YouTubeEmbeds) {

        }
    ]);

})(window.angular);
