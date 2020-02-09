import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HighlightJS} from "ngx-highlightjs";

@Component({
  selector: 'app-markdown-view',
  templateUrl: './markdown-view.component.html'
})
export class MarkdownViewComponent implements OnInit, AfterViewInit {

  @Input()
  private markdown: string;

  safeHtml: SafeHtml;

  constructor(private sanitizer: DomSanitizer, private hljs: HighlightJS) { }

  ngOnInit(): void {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdown);
  }

  ngAfterViewInit(): void {
    this.hljs.initHighlighting().subscribe();
  }

}
