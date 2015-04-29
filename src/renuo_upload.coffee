class RenuoUpload

  constructor: (@apikey, @element, @dropzoneOptions, @callback) ->
    @_checkRequirements()
    @_checkAdaptParams()
    jQuery.when(@_getUploadInfoAndSignature()).done(@_initializeDropzone)

  _initializeDropzone: =>
    Dropzone.autoDiscover = false

    jQuery(@element).addClass('dropzone')

    uploadDropzone = new Dropzone(@element, @dropzoneOptions)

    uploadDropzone.on 'success', (file) =>
      @callback(@_buildResult(file))

    uploadDropzone.on 'error', ->
      #todo inform sentry/new relic

  _cleanFilename: (originalName) ->
    originalName.toLowerCase().replace(/[ _]/g, '-').replace(/[^\w-.]/g, '')

  _getExtension: (originalName) ->
    originalName.split('.').pop()

  _getShortName: (cleanName) ->
    cleanName.replace(/\.[^/.]+$/, "")

  _getPublicUrl: (cleanName) ->
    "#{@cdnPath}#{cleanName}"

  _getUploadInfoAndSignature: ->
    jQuery.ajax({
      type: 'POST'
      url: 'domain/generate_policy' #todo define domain
      data:
        api_key: @apikey
      dataType: 'json'
    })
    .done( (responseJson) =>
      @dropzoneOptions.url = responseJson.url
      @dropzoneOptions.params = {}
      jQuery.each(responseJson.data, (k, v) =>
        @dropzoneOptions.params[k.replace(/_/g, '-')] = v
      )
      @cdnPath = '' #TODO take from response
    )
    .fail( ->
      throw new Error 'Failed to get credential for upload.'
    )

  _buildResult: (file) ->
    cleanFilename = @_cleanFilename(file.name)
    {
      orginalName: file.name
      cleanName: cleanFilename
      name: @_getShortName(cleanFilename)
      extension: @_getExtension(file.name)
      size: file.size
      publicUrl: @_getPublicUrl(cleanFilename)
    }

  _checkAdaptParams: ->
    @_checkElement()
    @_adaptCallback()
    @_adaptOptions()

  _checkRequirements: ->
    throw new Error 'RenuoUpload needs jQuery.' unless jQuery?
    throw new Error 'RenuoUpload needs Dropzone.' unless Dropzone?

  _checkElement: ->
    throw new Error 'Element is not defined' unless @element?
    @element = @element[0] if @element[0].nodeType?
    throw new Error 'Element is not a valid element' unless @element.nodeType?

  _adaptOptions: ->
    throw new Error 'DropzoneOptions is not defined' unless @dropzoneOptions?
    throw new Error 'DropzoneOptions.acceptedFiles is not defined' unless @dropzoneOptions.acceptedFiles?
    throw new Error 'DropzoneOptions.acceptedFiles is not a string' unless typeof @dropzoneOptions.acceptedFiles is 'string'
    @dropzoneOptions.parallelUploads = 25 unless @dropzoneOptions.parallelUploads?
    @dropzoneOptions.renameFilename = @_cleanFilename unless @dropzoneOptions.renameFilename?

  _adaptCallback: ->
    @callback = @_defaultCallback unless typeof @callback is 'function'

  _defaultCallback: (result) ->
    if jQuery(@element).parents('form').length
      name = result.name #TODO discuss with Lukas about upload of two times the same file
      delete result.name #TODO check if necessary, unexpected behavior, good point from Y
      jQuery.each(result, (k, v) =>
        jQuery(@element).parents('form').append("<input type='hidden' name='renuoupload[#{name}][#{k}]' value='#{v}'>")
      )

if module?
  module.exports = RenuoUpload
else
  window.RenuoUpload = RenuoUpload
