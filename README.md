# Renuo Upload

## Summary

Contains a top of dropzone JS-library for a multiple CORS upload.

## How to use?

### Installation 

```sh
bower install https://git.renuo.ch/renuo/renuo-upload.git
```
### Using

#### Initialzing

* apikey is a string
* element is a htmlelement or a string containg a id to a htmlelement
* [dropzoneOptions](http://www.dropzonejs.com/#configuration-options) passed to dropzone
* callback when a file is uploaded successful (optional, it has a default one)

```js
new RenuoUpload('apikey', element, dropzoneOptions, callback) 
```

#### Callback (if success)

##### Default

It has a default callback which will extend the form, if the element on which dropzone is initialized is in a form else the callback just do nothing. The form gets extended whit hidden inputfield for each file. But all files are nested under renuoupload. A file contains the orginal name, the clean name with extension, the clean name without extension, the extension, the size and the publicUrl of the uploaded file. The params on your server when the form gets submitted could look like that for an image called tiger_ultra_small_0.jpg:

```
"{renuoupload"=>{"tiger-ultra-small-0"=>{"orginalName"=>"tiger_ultra_small_0.jpg", "cleanName"=>"tiger-ultra-small-0.jpg", "extension"=>"jpg", "size"=>"22931", "publicUrl"=>"https://renuo-upload-develop.renuoapp.ch/undefinedtiger-ultra-small-0.jpg"}}"
```

##### Custom 
 
You can set a function as callback which will be executed with a result as param. A result contains the same values as if a form would be submitted from the defaultCallback. A result can be used like:

result.<attribute>

possible attributes:

* orginalName
* cleanName
* name      
* extension
* size
* publicUrl

## How does it work?

[Take a look at the wiki.](https://redmine.renuo.ch/projects/upload/wiki)


##Developing


### Setup

```sh
git clone
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
