import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {Subscription} from "rxjs";
import {HighlightJS} from "ngx-highlightjs";

@Component({
  selector: 'lks-markdown-view',
  templateUrl: './markdown-view.component.html'
})
export class MarkdownViewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @Input()
  public markdown: string = "";

  safeHtml: SafeHtml | undefined;

  private subscription: Subscription = new Subscription();

  constructor(private elRef: ElementRef, private sanitizer: DomSanitizer, private hljs: HighlightJS) {
  }

  ngOnInit() {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdown);
  }

  ngAfterViewInit() {
    this.elRef.nativeElement.querySelectorAll("pre code").forEach((item: HTMLElement) => {
      const sub = this.hljs.highlightBlock(item as HTMLElement).subscribe();
      this.subscription.add(sub);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.markdown);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
