(function(angular){
    'use strict';
    var app = angular.module('cards.services', ['ngResource']);

    app.factory('Audiences', ['$resource', function($resource){
        return $resource('/cards/api/audience/:id',
            {'id': '@id'});
    }]);

    app.factory('Axes', ['$resource', function($resource){
        return $resource('/cards/api/axis/:id',
            {'id': '@id'});
    }]);    

    app.factory('Cards', ['$resource', function($resource){
        return $resource('/cards/api/cards/:id',
            {'id': '@id'},
            {'update': {method: 'PUT'}});
    }]);

    app.factory('Likes', ['$resource', function($resource){
        return $resource('/cards/api/likes/:id',
            {'id': '@id'});
    }]);

    app.factory('Tags', ['$resource', function($resource){
        return $resource('/cards/api/tags/:id',
            {'id': '@id'});
    }]);

    app.factory('YouTubeEmbeds', ['$resource', function($resource){
        return $resource('/cards/api/youtube_embeds/:id',
            {'id': '@id'});
    }]);

})(window.angular);
