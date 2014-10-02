/*! angular-csv-import - v0.0.6 - 2014-07-11
* Copyright (c) 2014 ; Licensed  */
/*! angular-csv-import - v0.0.4 - 2014-07-10
* Copyright (c) 2014 ; Licensed  */
'use strict';

var ngS3Upload = angular.module('ngS3Upload', []);

ngS3Upload.directive('ngS3Upload', function() {
  return {
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
      awsRegion: '@',
      bucket: '@'
    },
    templateUrl: 'views/components/file-upload-button.html',
    link: function(scope, element, attr) {
      scope.awsApi.getAWSToken(scope.key).then(function(data){
        scope.aws = new Object();
        scope.aws.policy = data.policy;
        scope.aws.signature = data.signature;
        scope.aws.key = data.key;
      }, function(err){
        if (typeof scope.failureCallback != "undefined"){
          scope.failureCallback(err);
        }
        // die silently
      });
    },
    controller: function($scope) { 
      $scope.createUUID = function () {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
      };

      $scope.onFileSelect = function($files, index, type, callback) {
        for ( var i = 0; i < $files.length; i++) {
          var file = $files[i];
          var filename = $scope.createUUID();
          $scope.upload = $upload.upload({
            url: 'https://'+$scope.bucket+'.s3.amazonaws.com/',
            method: 'POST',
            data: {
                'key' : $scope.key+"/"+$scope.path+"/"+filename,
                'acl' : 'public-read',
                'Content-Type' : file.type,
                'AWSAccessKeyId': $scope.aws.key,
                'Policy' : $scope.aws.policy,
                'Signature' : $scope.aws.signature
            },
            file: file
          }).progress(function(evt) {
              // parseInt(100.0 * evt.loaded / evt.total));
              if ( typeof $progressCallback.progress != "undefined" ) {
                $scope.progressCallback(evt);
              }
          }).success(function(data, status, headers, config) {
            var rootPath = "";
            if ( typeof $scope.awsRegion != "undefined" ) {
              rootPath = "https://s3-"+$scope.awsRegion+".amazonaws.com/";
            }
            var url = rootPath+$scope.bucket+"/"+$scope.key+"/"+$scope.path+"/"+filename;
            if ( typeof $scope.successCallback != "undefined" ) {
              $scope.successCallback(url);
            }
          }).error(function(data, status, headers, config) {
            if ( typeof $scope.failureCallback != "undefined" ) {
              $scope.failureCallback(data, status, headers, config)
            }
            // die silently
          });
        }
      }
    }
  }
});