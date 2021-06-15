import {AfterViewInit, Component, ElementRef, forwardRef, Input, NgZone, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import * as EasyMDE from 'easymde';
import {HighlightJS} from "ngx-highlightjs";

const noop: any = () => {
  // empty method
};

@Component({
  selector: 'lks-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],
})
export class MarkdownEditorComponent implements AfterViewInit, ControlValueAccessor {
  private _value: string = '';
  private _easyMDE: any;
  private _fromEditor: boolean = false;

  private baseOptions = {
    autoDownloadFontAwesome: false,
    element: null,
    autoSave: {
      enabled: false
    },
    placeholder: "Type here...",
    spellChecker: false,
    previewClass: ["editor-preview", "markdown-body"],
    toolbar: ["bold", "italic", "heading-smaller", "heading-bigger", "|", "quote", "code", "unordered-list", "ordered-list", "clean-block",
      "|", "link", "image", "table", "upload-image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
    renderingConfig: {
      codeSyntaxHighlighting: true,
      hljs: undefined
    },
    uploadImage: true,
    imageUploadEndpoint: "/api/imageUpload",
    previewImagesInEditor: true,
    imagePathAbsolute: true,
    imageMaxSize: 1024 * 1024 * 5
  };

  @ViewChild('easymde', {static: true}) textarea: ElementRef | undefined;
  @Input() options: any = {};

  @Input()
  slim: boolean = false;

  constructor(private _zone: NgZone, private hljs: HighlightJS) {
  }

  propagateChange = (_: any) => {
  };
  onTouched = () => noop;

  /**
   * value?: string
   * Value in the Editor after async getEditorContent was called
   */
  @Input('value')
  set value(value: string) {
    this._value = value;
    if (this._easyMDE) {
      if (!this._fromEditor) {
        this._easyMDE.value(value);
      }
      this.propagateChange(this._value);
      this._fromEditor = false;
      this._zone.run(() => (this._value = value));
    }
  }

  get value(): string {
    return this._value;
  }

  get easyMDE(): any {
    return this._easyMDE;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  writeValue(value: any): void {
    this.value = !value ? '' : value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngAfterViewInit(): void {
    const opts = Object.assign({}, this.baseOptions);
    opts.renderingConfig.hljs = this.hljs.hljs;
    if (this.slim) {
      // @ts-ignore
      opts.status = false;
    }
    Object.assign(opts, this.options);
    opts.element = this.textarea.nativeElement;

    // @ts-ignore
    this._easyMDE = new EasyMDE(opts);
    this._easyMDE.value(this.value);
    this._easyMDE.codemirror.on('change', () => {
      this._fromEditor = true;
      this.writeValue(this._easyMDE.value());
    });
  }
}
