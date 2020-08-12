(function() {
    'use strict';
    angular.
        module('cardEdit').component('cardEdit', {
            templateUrl: '/cards/card-edit.template.html',
            controller: CardEditController,
            bindings: {
                card: '<',
            },
        });

        CardEditController.$inject = [
        '$scope',
        '$stateParams',
        'Cards',
    ];

    function CardEditController ($scope, $stateParams, Cards) {
        ctrl.$onInit = function() {
            $scope.card_id = $stateParams.cardId;
            $scope.classroom_id = $stateParams.classroomId;
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
    }
})();