import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {Snippet} from "@shared/models";
import {SnippetService} from "@app/entry/services/snippet.service";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-snippet-detail',
  templateUrl: './snippet-detail.component.html',
  styleUrls: ['./snippet-detail.component.scss']
})
export class SnippetDetailComponent implements OnInit {

  id: string;
  snippet: Snippet;
  version: string;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private snippetService: SnippetService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
      this.version = params.get("version");
      this.retrieveSnippet();
    });
  }

  private retrieveSnippet() {
    const observer = {
      next: data => {
        this.snippet = data;
        this.loadingStatus = LoadingStatus.LOADED;
        this.titleService.setTitle("Snippet Viewer - Lynks");
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    };
    if (this.version) {
      this.snippetService.getVersion(this.id, this.version).subscribe(observer);
    } else {
      this.snippetService.get(this.id).subscribe(observer);
    }
  }
}
