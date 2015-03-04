angular.module('templates/angular-s3-upload-button.html', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/angular-s3-upload-button.html',
    "<div class=\"upload-button\">\n" +
    "\t<label for=\"file\" class=\"ui icon button {{buttonClass}}\">\n" +
    "\t\t<i class=\"file icon\"></i><span lng=\"{{label}}\"></span>\n" +
    "\t</label>\n" +
    "\t<input type=\"file\" id=\"file\" style=\"display:none\" \n" +
    "\t\tng-file-select=\"onFileSelect($files, index)\"></input>\n" +
    "</div>"
  );

}]);
