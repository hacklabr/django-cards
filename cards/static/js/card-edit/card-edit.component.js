(function() {
    'use strict';
    angular.
        module('cardEdit').
        component('cardEdit', {
            templateUrl: '/cards/card-edit.template.html',
            controller: 'CardDetailCtrl',
            bindings: {
                card: '<',
            },
        });

        CardEditController.$inject = [
        '$scope',
        'Audiences',
        'Axes',
        'Cards',
        'Tags',
    ];

    function CardEditController ($scope, Audiences, Axes, Cards, Tags) {

    }
})();