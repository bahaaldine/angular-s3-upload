'use strict';

var ngS3Upload = angular.module('angular-s3-upload', ["angular-s3-upload-tpls"]);
ngS3Upload.directive('ngS3Upload', [ '$upload', '$q', function($upload, $q) {
  return {
    restrict: 'EA',
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
      filename: '@',
      maxWidth: '@',
      maxHeight: '@'
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

      var dataURItoBlob = function(dataURI) {
          var byteString;
          if (dataURI.split(',')[0].indexOf('base64') >= 0)
              byteString = atob(dataURI.split(',')[1]);
          else
              byteString = unescape(dataURI.split(',')[1]);

          var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

          var ia = new Uint8Array(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
          }
          return {blob: new Blob([ia], {type:mimeString}), type: mimeString};
      };

      var resizeImage = function(file) {
        var deferred = $q.defer();  
        var canvas = document.createElement('canvas');
       
        var img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = function() {
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          var width = img.width;
          var height = img.height;
          if (width > height) {
            if (width > $scope.maxWidth) {
              height *= $scope.maxWidth / width;
              width = $scope.maxWidth;
            }
          } else {
            if (height > $scope.maxHeight) {
              width *= $scope.maxHeight / height;
              height = $scope.maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;

          ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0,0, width, height);

          var dataURL = canvas.toDataURL('image/png', 1.0);
          deferred.resolve(dataURItoBlob(dataURL));
        };

        return deferred.promise;
      };

      $scope.onFileSelect = function($files) {
        for ( var i = 0; i < $files.length; i++) {
          var file = $files[i];
          if ( !angular.isDefined($scope.filename) ) {
              $scope.filename = $scope.createUUID();
          }
          var fullPath = $scope.key+"/"+$scope.filename;
          if ( angular.isDefined($scope.path) ) {
            fullPath = $scope.key+"/"+$scope.path+"/"+$scope.filename;
          }

          var config = {};
          if ( !angular.isDefined($scope.maxWidth) || !angular.isDefined($scope.maxHeight) ) {
            config = {
              transformRequest: angular.identity,
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
            };
            uploadFile(config);
          } else {
            resizeImage(file).then(function(resized) {
              config = {
                transformRequest: angular.identity,
                url: 'https://'+$scope.bucket+'.s3.amazonaws.com/',
                method: 'POST',
                data: {
                    'key' : fullPath,
                    'acl' : 'public-read',
                    'Content-Type' : resized.type,
                    'AWSAccessKeyId': $scope.aws.key,
                    'Policy' : $scope.aws.policy,
                    'Signature' : $scope.aws.signature,
                    'file': resized.blob
                }
              };
              uploadFile(config);
            });
          }
        }
      };

      var uploadFile = function(config) {
        $scope.upload = $upload.upload(config).progress(function(evt) {
            // parseInt(100.0 * evt.loaded / evt.total));
            if ( typeof $scope.progressCallback.progress !== "undefined" ) {
              $scope.progressCallback(evt);
            }
        }).success(function(data, status, headers, config) {
          if ( typeof $scope.successCallback !== "undefined" ) {
            $scope.successCallback($scope.filename+ '?cb=' + (new Date().getTime()).toString(), $scope.index, data, status, headers, config);
          }
        }).error(function(data, status, headers, config) {
          if ( typeof $scope.failureCallback !== "undefined" ) {
            $scope.failureCallback($scope.index, data, status, headers, config);
          } // die silently
        });
      };
    }
  };
}]);