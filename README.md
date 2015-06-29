# Renuo Upload Prototype

## Just a prototype?

Yes, but it's stable and already used in production. 

## What will change in future?

* CoffeeScript will be replaced by TypeScript
* The test coverage will definitely increase (goal is a full tested library)
* The library will be published on bower
* Documentation Page will follow
* An angular example will follow

## Summary

A modern, open source, scalable upload solution.

## How to use?

### Installation

```sh
bower install https://github.com/renuo/renuo-upload.git
```

### Using

#### Complete Example

The example is located in the example (can be used for development)

```html
<!doctype html>
<html lang="en">
<body>
  <!-- create a html element on which you wan't the upload, id or class dosen't matter -->
  <!-- set the data attributes -->
  <div id='example' data-apikey="12345678" data-signingurl="http://domain/generate_policy"></div>
  <!-- include all dependencies -->
  <script src='../bower_components/dropzone/dist/dropzone.js'></script>
  <script src='../bower_components/jquery/dist/jquery.js'></script>
  <!-- include renuo-upload -->
  <script src='../dist/renuo_upload.min.js'></script>
  <script>
    (function() {
      //example custom callback
      var logResult = function (result) {
        console.log(result);
        console.log("filename orginal: " + result.orginalName);
        console.log("filename clean: " + result.cleanName);
        console.log("filename clean & short: " + result.name);
        console.log("filename extension: " + result.extension);
        console.log("filename size: " + result.size);
        console.log("public url: " + result.publicUrl);
      };
      // get your created element
      var element = $('#example'); //or document.querySelector('#example')
      //all possible options for dropzone
      var dropzoneOptions = {
        acceptedFiles: 'image/*,application/pdf,.psd' //always needed, look at http://www.dropzonejs.com/#config-acceptedFiles
      };
      //that is it! so simple.
      new RenuoUpload(element, dropzoneOptions, logResult);
    }).call(this);
  </script>
</body>
</html>
</html>
```

#### Rails Helper

```ruby
module RenuoUploadHelper
   #creates a image_tag with the right url for renuo upload images
   #base_url of the file (saved in the db), looks like g1h7/ae3g/sds2/1n3h/filename
   #options is a string, all thumbor options possible, look here https://github.com/thumbor/thumbor/wiki/Usage
   #tag_attrs is a hash which is direct passed to the normal image_tag (all options like class: 'red' are possible)
   def renuo_upload_image_tag(base_url, options = nil, tag_attrs = {})
     image_tag(renuo_upload_image_url(base_url, options), tag_attrs)
   end
 
   #creates the right url for renuo upload images
   #base_url of the file (saved in the db), looks like g1h7/ae3g/sds2/1n3h/filename
   #options is a string, all thumbor options possible, look here https://github.com/thumbor/thumbor/wiki/Usage
   def renuo_upload_image_url(base_url, options = nil)
     "https://#{renuo_upload_cdn_host}/#{renuo_upload_image_path(base_url, options)}"
   end
 
   private
   #returns the image_path
   def renuo_upload_image_path(base_url, options)
     #for thumbnail (t/) if options are set
     return "t/#{options}/u/o/#{renuo_upload_app_name}/#{base_url}" if options
 
     #else it returns the original (o/) image path
     "o/#{renuo_upload_app_name}/#{base_url}"
   end
 
   def renuo_upload_cdn_host
     #cdn host where the files are available, set over env 
     ENV['RENUO_UPLOAD_CDN_HOST']
   end
 
   def renuo_upload_app_name
     #app name who the app is named (has to match with the name defined with the api_key)
     ENV['RENUO_UPLOAD_APP_NAME']
   end
 end

```

#### Initialzing

* apikey is a string
* element is a htmlelement
* [dropzoneOptions](http://www.dropzonejs.com/#configuration-options) passed to dropzone
* callback when a file is uploaded successful (optional, it has a default one)

```js
// dont't forget to set the data attributes for the apikey and siningurl on the element you pass to the upload
new RenuoUpload(element, dropzoneOptions, callback):
```

#### Callback (if success)

##### Default

It has a default callback which will extend the form, if the element on which dropzone is initialized is in a form else 
the callback just do nothing. The form gets extended whit hidden inputfield for each file. But all files are nested 
under renuoupload. A file contains the orginal name, the clean name with extension, the clean name without extension, 
the extension, the size and the publicUrl of the uploaded file. The params on your server when the form gets submitted 
could look like that for an image called tiger_ultra_small_0.jpg:

```
"{renuoupload"=>{"tiger-ultra-small-0"=>{"orginalName"=>"tiger_ultra_small_0.jpg", "cleanName"=>"tiger-ultra-small-0.jpg",
 "extension"=>"jpg", "size"=>"22931", "publicUrl"=>"https://renuo-upload-develop.renuoapp.ch/undefinedtiger-ultra-small-0.jpg"}}"
```

##### Custom 
 
You can set a function as callback which will be executed with a result as param. A result contains the same values as 
if a form would be submitted from the defaultCallback. A result can be used like:

result.<attribute>

possible attributes:

* orginalName
* cleanName
* name      
* extension
* size
* publicUrl

## How does it work?

[Take a look at the presentation of Renuo Upload.](https://www.renuo.ch/pdfs/15-06-24-renuo-upload.pdf)

### All services

* [Renuo Upload Signing](https://github.com/renuo/renuo-upload-signing)
* [Renuo Thumbor Proxy](https://github.com/renuo/renuo-thumbs-proxy)
* [Renu Thumbor](https://github.com/renuo/renuo-thumbor)
* [AWS S3 / Cloudfront]()

## Developing

### Setup

You must have node.js and its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

```sh
git clone https://github.com/renuo/renuo-upload.git
npm install
```

### Everything you have to do during development

```sh
gulp
```

### Release

```sh
gulp release
```

### Tests

Coming soon.

## Problems?

If problems should arise, either contact Cyril Kyburz or Lukas Elmer.

![Cyril Kyburz](http://www.gravatar.com/avatar/4f522497d9145b89661c381d5fd7a50c)
![Lukas Elmer](https://www.gravatar.com/avatar/697b8e2d3bde4d895eca4fe2dcfe9239)

## MIT License

Coypright 2015 [Renuo GmbH](https://www.renuo.ch/). See [LICENSE](LICENSE) file.
