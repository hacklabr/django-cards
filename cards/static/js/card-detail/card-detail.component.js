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
        'Cards',
        'Likes',
    ];

    function CardsDetailController ($scope, $rootScope, $stateParams, $sce, Cards, Likes) {

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