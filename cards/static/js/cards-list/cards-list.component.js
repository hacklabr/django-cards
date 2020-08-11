(function() {
    'use strict';
    angular.
        module('cardsList').
        component('cardsList', {
            templateUrl: '/cards/cards-list.template.html',
            controller: CardsListController,
            bindings: {
                group: '<',
                enableAddCardButton: '<',
            },
        });

    CardsListController.$inject = [
        '$filter',
        '$scope',
        'Audiences',
        'Axes',
        'Cards',
        'Tags',
    ];

    function CardsListController ($filter, $scope, Audiences, Axes, Cards, Tags) {

        var ctrl = this;

        this.$onInit = function() {
            $scope.$watchCollection('card_filter', function(newVal, oldVal) {
                $scope.get_cards();
            });
        };
        
        var encode = $filter('encode');
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

        $scope.show_filter_options = true;
        $scope.keyword = '';
        if (!$scope.card_filter) {
            $scope.card_filter = {};
            $scope.card_filter.keyword = '';
            $scope.card_filter.audience = '';
            $scope.card_filter.axis = '';
            $scope.card_filter.status = '';
            $scope.card_filter.tags = [];
        }
        else {
            $scope.keyword = $scope.card_filter.keyword;
        }

        $scope.clean_filters = function() {
            $scope.keyword = '';
            $scope.card_filter.keyword = '';
            $scope.card_filter.audience = '';
            $scope.card_filter.axis = '';
            $scope.card_filter.status = '';
            $scope.card_filter.tags = [];
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
            $scope.card_filter.keyword = $scope.keyword;
            $scope.blank_filters =
                $scope.card_filter.keyword === '' &&
                $scope.card_filter.audience === '' &&
                $scope.card_filter.axis === '' &&
                $scope.card_filter.status === '' &&
                $scope.card_filter.tags.length === 0;
            var keyword = encode($scope.card_filter.keyword)
                            .replace(/;/g, '%3B');
            let query = {
                audience__name: $scope.card_filter.audience,
                axis__name: $scope.card_filter.axis,
                is_certified: $scope.card_filter.status,
                search: keyword,
                tags__name: $scope.card_filter.tags.map(function(tag) {
                    return tag.name;
                }),
            };
            if (ctrl.group) {
                query['groups'] = ctrl.group.id;
            }
            Cards.query(query, function(data) {
                $scope.cards.all = data;
                filter_by_status();
                $scope.certified_base_slide = 0;
                $scope.community_base_slide = 0;
                $scope.slider.certified = get_slides_row($scope.cards.certified, $scope.certified_base_slide);
                $scope.slider.community = get_slides_row($scope.cards.community, $scope.community_base_slide);
            });
        };

        /* Tags */
        $scope.insert_tag = function(tag) {
            if (tag !== '' && $scope.card_filter.tags.indexOf(tag) == -1) {
                $scope.card_filter.tags.push({name: tag.toLowerCase()});
                $scope.get_cards();
            }
            $scope.tag = '';
        }
        $scope.remove_tag = function(index) {
            $scope.card_filter.tags.splice(index, 1);
            $scope.get_cards();
        };
    }
})();