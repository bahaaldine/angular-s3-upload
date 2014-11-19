'use strict';

var ngS3Upload = angular.module('angular-s3-upload', ["angular-s3-upload-tpls"]);
ngS3Upload.directive('ngS3Upload', [ '$upload', function($upload) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      label: '@',
      uploadHelper: '=',
      buttonClass: '@',
      index: '=',
      key: '@',
      path: '@',
      successCallback: '=',
      failureCallback: '=',
      progressCallback: '=',
      awsApi:'=',
      bucket: '@',
      filename: '@'
    },
    templateUrl: 'templates/angular-s3-upload-button.html',
    link: function(scope, element, attr) {
      scope.awsApi.getAWSToken(scope.key).then(function(data){
        scope.aws = {};
        scope.aws.policy = data.policy;
        scope.aws.signature = data.signature;
        scope.aws.key = data.key;
      }, function(err){
        if (typeof scope.failureCallback !== "undefined"){
          scope.failureCallback(err);
        } // die silently
      });
    },
    controller: function($scope) { 
      $scope.createUUID = function () {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
      };

      $scope.onFileSelect = function($files) {
        for ( var i = 0; i < $files.length; i++) {
          var file = $files[i];
          if ( typeof $scope.filename == "undefined" ) {
            $scope.filename = $scope.createUUID();
          }
          var fullPath = $scope.key+"/"+$scope.filename;
          if ( typeof $scope.path != "undefined" ) {
            fullPath = $scope.key+"/"+$scope.path+"/"+$scope.filename;
          }
          $scope.upload = $upload.upload({
            url: 'https://'+$scope.bucket+'.s3.amazonaws.com/',
            method: 'POST',
            data: {
                'key' : fullPath,
                'acl' : 'public-read',
                'Content-Type' : file.type,
                'AWSAccessKeyId': $scope.aws.key,
                'Policy' : $scope.aws.policy,
                'Signature' : $scope.aws.signature
            },
            file: file
          }).progress(function(evt) {
              // parseInt(100.0 * evt.loaded / evt.total));
              if ( typeof $scope.progressCallback.progress !== "undefined" ) {
                $scope.progressCallback(evt);
              }
          }).success(function(data, status, headers, config) {
            if ( typeof $scope.successCallback !== "undefined" ) {
              $scope.successCallback($scope.filename, $scope.index, data, status, headers, config);
            }
          }).error(function(data, status, headers, config) {
            if ( typeof $scope.failureCallback !== "undefined" ) {
              $scope.failureCallback($scope.index, data, status, headers, config, $scope.index);
            } // die silently
          });
        }
      };
    }
  };
}]);