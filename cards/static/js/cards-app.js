(function(angular){
    'use strict';

    var app = angular.module('cards', [
        'cards.controllers',
        'cards.directives',
        'cards.services',
        'ngFileUpload',
        'ngRoute',
        'header',
        'django',
    ]);

    app.config(['$locationProvider', '$routeProvider',
        function config($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider.
                when('/new', {
                    templateUrl: '/cards/new/',
                    controller: 'NewCardCtrl',
                }).
                when('/:cardId/edit', {
                    templateUrl: '/cards/new/',
                    controller: 'EditCardCtrl'
                }).
                when('/:cardId', {
                    templateUrl: '/cards/detail/',
                    controller: 'CardDetailCtrl'
                }).
                when('/', {
                    templateUrl: '/cards/cards-list/',
                    controller: 'CardsListCtrl'
                }).
                otherwise('/');
        }
    ]);

})(angular);
