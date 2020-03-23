import {AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {HighlightJS} from "ngx-highlightjs";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-markdown-view',
  templateUrl: './markdown-view.component.html'
})
export class MarkdownViewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input()
  private markdown: string;

  safeHtml: SafeHtml;

  private subscriptions: Subscription[] = [];

  constructor(private sanitizer: DomSanitizer, private hljs: HighlightJS) {
  }

  ngOnInit(): void {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdown);
  }

  ngAfterViewInit(): void {
    document.querySelectorAll("pre code").forEach(item => {
      const sub = this.hljs.highlightBlock(item as HTMLElement).subscribe();
      this.subscriptions.push(sub);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdown);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
