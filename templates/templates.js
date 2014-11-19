angular.module('templates/angular-s3-upload-button.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/angular-s3-upload-button.html',
    "<div class=\"upload-button\">\n" +
    "\t<button class=\"{{buttonClass}}\" lng=\"{{label}}\"></button>\n" +
    "\t<input type=\"file\" ng-file-select=\"onFileSelect($files, index)\"></input>\n" +
    "</div>"
  );

}]);
