(function() {
    'use strict';
    angular.
        module('cardDetail').
        component('cardDetail', {
            templateUrl: '/cards/card-detail.template.html',
            controller: CardsDetailController,
            bindings: {
                group: '<',
            },
        });

    CardsDetailController.$inject = [
        '$filter',
        '$scope',
        'Audiences',
        'Axes',
        'Cards',
        'Tags',
    ];

    function CardsDetailController ($filter, $scope, Audiences, Axes, Cards, Tags) {

    }
})();