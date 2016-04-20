/// <reference path="../typings/main/ambient/dropzone/index.d.ts" />
/// <reference path="../typings/main/ambient/jquery/index.d.ts" />
/// <reference path="../typings/main/ambient/ravenjs/index.d.ts" />
/// <reference path="renuo_upload_result.d.ts"/>
/// <reference path="renuo_signing_response.d.ts"/>

class RenuoUpload {
  private apiKey:string;
  private signingUrl:string;
  private fileUrlPath:string;
  private filePrefix:string;
  private element:HTMLElement;

  constructor(elementOrElements:HTMLElement|HTMLElement[], private dropzoneOptions:DropzoneOptions, private callback:Function) {
    this.element = this.convertElementOrElements(elementOrElements);
    this.checkRequirements();
    this.initializeOptions();
    this.checkAdaptParams();
    this.getUploadInfoAndSignature().done(() => this.initializeDropzone());
  }

  private convertElementOrElements(elementOrElements:HTMLElement|HTMLElement[]):HTMLElement {
    if ((<HTMLElement[]>elementOrElements)[0].nodeType) return (<HTMLElement[]>elementOrElements)[0];
    return <HTMLElement>elementOrElements;
  }

  private initializeDropzone() {
    jQuery(this.element).addClass('dropzone');
    const uploadDropzone:Dropzone = new Dropzone(this.element, this.dropzoneOptions);

    uploadDropzone.on('success', (file) => this.callback(this.buildResult(file)));

    uploadDropzone.on('error', (file:DropzoneFile, message:string|Error) => {
      this.captureSentryError(message);
    });
    return true;
  }

  private initializeOptions() {
    this.apiKey = jQuery(this.element).data('apikey');
    this.signingUrl = jQuery(this.element).data('signingurl');
  }

  private captureSentryError(message:string|Error):void {
    if (!window.Raven) return;

    if (message instanceof Error) {
      window.Raven.captureException(<Error>message);
    } else {
      window.Raven.captureMessage(<string>message);
    }
  }

  private cleanFilename(originalName:string):string {
    return originalName.toLowerCase().replace(/[ _]/g, '-').replace(/[^\w-.]/g, '');
  }

  private getExtension(originalName:string):string {
    return originalName.split('.').pop();
  }

  private getShortName(cleanName:string):string {
    return cleanName.replace(/\.[^/.]+$/, '');
  }

  private getPublicUrl(cleanName:string):string {
    return `${this.fileUrlPath}${cleanName}`;
  }

  private getFilePath(cleanName:string):string {
    return `${this.filePrefix}${cleanName}`;
  }

  private getUploadInfoAndSignature():JQueryPromise<any> {
    return jQuery.ajax({
      type: 'POST',
      url: this.signingUrl,
      data: {
        api_key: this.apiKey
      },
      dataType: 'json'
    }).done((responseJson:RenuoSigningResponse) => {
      this.dropzoneOptions.url = responseJson.url;
      this.dropzoneOptions.params = {
        key: responseJson.data.key,
        acl: responseJson.data.acl,
        policy: responseJson.data.policy,
        'x-amz-algorithm': responseJson.data.x_amz_algorithm,
        'x-amz-credential': responseJson.data.x_amz_credential,
        'x-amz-expires': responseJson.data.x_amz_expires,
        'x-amz-signature': responseJson.data.x_amz_signature,
        'x-amz-date': responseJson.data.x_amz_date,
        utf8: responseJson.data.utf8
      };
      this.filePrefix = responseJson.file_prefix;
      this.fileUrlPath = responseJson.file_url_path;
    }).fail(() => {
      throw new Error('Failed to get credential for upload.');
    });
  }

  private buildResult(file:DropzoneFile):RenuoUploadResult {
    const cleanFilename:string = this.cleanFilename(file.name);
    return {
      orginalName: file.name,
      cleanName: cleanFilename,
      name: this.getShortName(cleanFilename),
      extension: this.getExtension(file.name),
      size: file.size,
      publicUrl: this.getPublicUrl(cleanFilename),
      filePath: this.getFilePath(cleanFilename)
    };
  }

  private checkAdaptParams() {
    this.checkElement();
    this.adaptCallback();
    this.adaptOptions();
  }

  private checkRequirements() {
    if (!jQuery) throw new Error('RenuoUpload needs jQuery.');
    if (!Dropzone) throw new Error('RenuoUpload needs Dropzone.');
  }

  private checkElement() {
    if (!this.element) throw new Error('Element is not defined');
    if (!this.element.nodeType) throw new Error('Element is not a valid element');
  }

  private adaptOptions() {
    if (!this.dropzoneOptions) throw new Error('DropzoneOptions is not defined');
    if (!this.dropzoneOptions.acceptedFiles) {
      throw new Error('DropzoneOptions.acceptedFiles is not defined');
    }
    if (typeof this.dropzoneOptions.acceptedFiles !== 'string') {
      throw new Error('DropzoneOptions.acceptedFiles is not a string');
    }
    if (!this.dropzoneOptions.parallelUploads) this.dropzoneOptions.parallelUploads = 25;
    if (!this.dropzoneOptions.renameFilename) this.dropzoneOptions.renameFilename = this.cleanFilename;
  }

  private adaptCallback() {
    if (typeof this.callback !== 'function')
      this.callback = this.defaultCallback;
  }

  private defaultCallback(result:RenuoUploadResult) {
    // TODO discuss with Lukas about upload of two times the same file
    if (jQuery(this.element).parents('form').length) {
      jQuery.each(result, (k:string, v:string) => {
        if (k === 'name') return true;
        const parentForm:JQuery = jQuery(this.element).parents('form');
        parentForm.append(`<input type='hidden' name='renuoupload[${name}][${k}]' value='${v}'>`);
      });
    }
  }
}

interface Window {
  RenuoUpload:typeof RenuoUpload;
  Raven:typeof Raven;
}
declare var module:any;

if (window) {
  window.RenuoUpload = RenuoUpload;
} else if (module) {
  module.exports = RenuoUpload;
}
