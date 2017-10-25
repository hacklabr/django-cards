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

    app.factory('Images', ['$resource', 'Upload', function($resource, Upload){
        var img_file = $resource('/cards/api/images/:id',
            {'id': '@id'});

        img_file.upload = function (file, description) {
            return Upload.upload({
                url: '/cards/api/images',
                data: {
                    name: file.name,
                    image: file,
                    description: description
                },
                arrayKey: '',
            });
        };
        return img_file;
    }]);

    app.factory('Likes', ['$resource', function($resource){
        return $resource('/cards/api/likes/:id',
            {'id': '@id'});
    }]);

    app.factory('Tags', ['$resource', function($resource){
        return $resource('/cards/api/tags/:id',
            {'id': '@id'});
    }]);

    app.factory('TinymceOptions', function(){
        return {
            toolbar: 'bold italic | bullist numlist | quicklink link fullscreen | removeformat',
            plugins: 'advlist lists autolink link image media autoresize paste',
            paste_as_text: true,
            formats: {
                removeformat: [
                    {selector: 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand: true, deep : true},
                    {selector: 'h1,h2,h3,h4,h5,h6', remove : 'all', split : true, expand : false, block_expand: false, deep : true},
                    {selector: 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
                    {selector: '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
                  ]
            }
        }
    });

    app.factory('YouTubeEmbeds', ['$resource', function($resource){
        return $resource('/cards/api/youtube_embeds/:id',
            {'id': '@id'});
    }]);

})(window.angular);
