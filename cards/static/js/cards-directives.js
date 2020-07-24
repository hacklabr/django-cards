(function(angular) {
    'use strict';
    var app = angular.module('cards.directives', []);

    app.directive('files',
        function() {
            return {
                restrict: "E",
                templateUrl: "/static/templates/files.html",
                scope: {
                    files: '=',
                    progress: '=',
                    editable: '=',
                },
                controller: ['$scope', 'CardFile', function($scope, CardFile){
                    $scope.deleteFile = function(i){
                        CardFile.delete({id: $scope.files[i].id});
                        $scope.files.splice(i,1);
                    };
                }],
            };
        }
    );

})(window.angular);
