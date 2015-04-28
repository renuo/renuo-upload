class RenuoUpload

  constructor: (@apikey, @element, @dropzoneOptions, @callback) ->
    $.when(@_checkRequirements(), @_getCredentials(), @_checkAdaptParams()).done(@_initializeDropzone)

  _initializeDropzone: =>
    Dropzone.autoDiscover = false

    $(@element).addClass('dropzone')

    uploadDropzone = new Dropzone(@element, @dropzoneOptions)

    uploadDropzone.on 'success', (file) =>
      @callback(@_buildResult(file))

    uploadDropzone.on 'error', ->
      #todo inform sentry/new relic

  _cleanFilename: (name) ->
    name.toLowerCase().replace(/[ _]/g, '-').replace(/[^\w-.]/g, '')

  _getExtension: (name) ->
    name.split('.').pop()

  _getName: (name) ->
    name.replace(/\.[^/.]+$/, "")

  _getPublicUrl: (name) ->
    "https://renuo-upload-develop.renuoapp.ch/#{@publicUrlPath}#{name}"

  _getCredentials: ->
    deferred = $.Deferred()
    $.ajax({
      type: 'POST' #TODO discuss with N
      url: '/auctions/a1/images_uploads'
      data:
        api_key: @apikey
      dataType: 'json'
    })
    .done( (responseJson) =>
      @dropzoneOptions.url = responseJson.url
      @dropzoneOptions.params = {}
      $.each(responseJson.data, (k, v) =>
        @dropzoneOptions.params[k.replace(/_/g, '-')] = v
      )
      @cdnPath = '' #TODO take from response
      deferred.resolve()
    )
    .fail( ->
      throw new Error 'Failed to get credential for upload.'
    )
    deferred

  _buildResult: (file) ->
    cleanFilename = @_cleanFilename(file.name)
    {
      orginalName: file.name
      cleanName: cleanFilename
      name: @_getName(cleanFilename)
      extension: @_getExtension(file.name)
      size: file.size
      publicUrl: @_getPublicUrl(cleanFilename)
    }

  _checkAdaptParams: ->
    deferred = $.Deferred()
    @_checkElement()
    @_adaptCallback()
    @_adaptOptions()
    deferred.resolve()
    deferred

  _checkRequirements: ->
    deferred = $.Deferred()
    throw new Error 'RenuoUpload needs jQuery.' unless $?
    throw new Error 'RenuoUpload needs Dropzone.' unless Dropzone?
    deferred.resolve()
    deferred

  _checkElement: ->
    throw new Error 'Element is not defined' unless @element?
    throw new Error 'Element is not a string' unless typeof @element is 'string'

  _adaptOptions: ->
    throw new Error 'DropzoneOptions is not defined' unless @dropzoneOptions?
    throw new Error 'DropzoneOptions.acceptedFiles is not defined' unless @dropzoneOptions.acceptedFiles?
    throw new Error 'DropzoneOptions.acceptedFiles is not a string' unless typeof @dropzoneOptions.acceptedFiles is 'string'
    @dropzoneOptions.parallelUploads = 10000 unless @dropzoneOptions.parallelUploads?
    @dropzoneOptions.renameFilename = @_cleanFilename unless @dropzoneOptions.renameFilename?

  _adaptCallback: ->
    @callback = @_defaultCallback unless typeof @callback is 'function'

  _defaultCallback: (result) ->
    if $(@element).parents('form').length
      name = result.name #TODO discuss with Lukas about upload of two times the same file
      delete result.name #TODO check if necessary, unexpected behavior, good point from Y
      $.each(result, (k, v) =>
        $(@element).parents('form').append("<input type='hidden' name='renuoupload[#{name}][#{k}]' value='#{v}'>")
      )

if module?
  module.exports = RenuoUpload
else
  window.RenuoUpload = RenuoUpload
