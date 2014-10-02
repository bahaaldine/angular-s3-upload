[![Build Status](https://travis-ci.org/bahaaldine/angular-s3-upload.svg?branch=master)](https://travis-ci.org/bahaaldine/angular-s3-upload)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

# Angular S3 Upload

Angular S3 upload is a directive that buils a file input button 
to upload data on your AWS S3 server.

It supports 
 - upload success, failure, progress callback.
 - input button customization
 - passing a promise that contains your AWS S3 token.
 - i18n.

## Prerequisites 
1. Create AWS S3 bucket

2. Grant "put/delete" permissions to everyone 
In AWS web interface, select S3 and select the destination bucket, then 
expand the "Permissions" sections and click on the "Add more permissions" button. Select "Everyone" and "Upload/Delete" and save.

3. Add CORS configuration to your bucket

  In AWS web interface, select S3 and select the wanted bucket. 
  Expand the "Permissions" section and click on the "Add CORS configuration" button. Paste the wanted CORS configuration, for example: 
  ```XML
  <?xml version="1.0" encoding="UTF-8"?>
  <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
      <CORSRule>
          <AllowedOrigin>*</AllowedOrigin>
          <AllowedMethod>GET</AllowedMethod>
          <AllowedMethod>POST</AllowedMethod>
          <AllowedMethod>PUT</AllowedMethod>
          <AllowedHeader>*</AllowedHeader>
      </CORSRule>
  </CORSConfiguration>
    ```

  In addition, create a bucket policy by clicking the "Edit Bucket Policy", here is an example: 

  ```JSON
  {
	"Version": "2008-10-17",
	"Id": "PolicyId",
	"Statement": [
		{
			"Sid": "",
			"Effect": "Allow",
			"Principal": {
				"AWS": "arn:aws:iam::XXXXXXXX:user/bucket"
			},
			"Action": "s3:*",
			"Resource": [
				"arn:aws:s3:::bucket",
				"arn:aws:s3:::bucket/*"
			]
		}
	]
  }
  ```
  [more info here](http://docs.aws.amazon.com/AmazonS3/latest/dev/example-bucket-policies.html)

  Once the CORS permissions are updated, your bucket is ready for client side uploads.

4. Server side API that return AWS S3 token. The token must have the following structure : 

	```JSON
	{
		"policy":"BASE_64_ENCODED_AWS_S3_UPLOAD_POLICY",
		"signature":"HMAC_SHA1_OF_POLICY_AND_YOUR_AWS_SECRET",
		"key":"YOUR_AWS_ACCESS_KEY"
	}
	```


## Installation

Install depedencies using bower: 
```
bower install angular-s3-upload
```

Add js libraries to your application:
```html
	...
	<script src="bower_components/angular-s3-upload/dist/angular-s3-upload.js"></script>
    ...
```

Add ngCSVImport module to you application
```javascript
	...
	angular
	  .module('myAwesomeApp', [
	    ...
	    'ngS3Upload',
	    ...
	  ])
	...
```

## Usage
Include the **ng-csv-import** element with its options:

```html
<ng-s3-upload
     button-class="..."
     key="..."
     bucket="..."
     path="..."
     success-callback="..."
     failure-callback="..."
     progress-callback="..."
     aws-api="..."
     aws-region="..."
     label="..."></ng-s3-upload>
```

- **button-class**

CSS class for HTML input file element

- **bucket**

AWS S3 Bucket name.


- **key**

AWS S3 key. Typically the folder whitin your bucket where you want to upload your stuff


- **path**

Path under the AWS S3 key where you want to store the files
ex: if the bucket if **foo** and the key is **bar** then you can have something like this:
foo/bar/my_underlying_path_to_files

- **success-callback**

The callback to trigger when upload has succeeded.

- **failure-callback**

The callback to trigger when upload has failed.

- **progress-callback**

The callback to trigger during upload

- **aws-api**

A promise that return AWS S3 token. 

- **aws-region**

AWS S3 region

- **label**

A label for your upload button. Usefull for i18n.
