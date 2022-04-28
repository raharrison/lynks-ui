import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, EntryType, NewSnippet, Snippet, Tag} from "@shared/models";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {SnippetService} from "@app/entry/services/snippet.service";
import {RouteProviderService} from "@shared/services/route-provider.service";
import {EntryService} from "@app/entry/services/entry.service";

@Component({
  selector: 'lks-snippet-edit',
  templateUrl: './snippet-edit.component.html',
  styleUrls: ['./snippet-edit.component.scss']
})
export class SnippetEditComponent implements OnInit {
  EntryType = EntryType;

  loadingStatus: LoadingStatus = LoadingStatus.LOADED;
  saving = false;
  updateMode = false;

  snippet: NewSnippet;
  private oldSnippet: Snippet;

  selectedTags: Tag[] = [];
  selectedCollections: Collection[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              public routeProvider: RouteProviderService,
              private entryService: EntryService,
              private snippetService: SnippetService) {
  }

  ngOnInit() {
    this.snippet = {
      id: null,
      tags: [],
      collections: [],
      plainText: "",
    };
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.updateMode = true;
      this.loadingStatus = LoadingStatus.LOADING;
      this.snippetService.get(id).subscribe({
        next: data => {
          this.oldSnippet = data;
          this.snippet.id = data.id;
          this.snippet.plainText = data.plainText;
          this.selectedTags = data.tags;
          this.selectedCollections = data.collections;
          this.loadingStatus = LoadingStatus.LOADED;
        }, error: () => {
          this.loadingStatus = LoadingStatus.ERROR;
        }
      });
    }
  }

  onSubmit(saveNewVersion: boolean) {
    this.snippet.tags = this.selectedTags.map(t => t.id);
    this.snippet.collections = this.selectedCollections.map(c => c.id);
    this.saving = true;
    if (this.updateMode) {
      this.updateSnippet(saveNewVersion);
    } else {
      this.createSnippet();
    }
  }

  private createSnippet() {
    this.snippetService.create(this.snippet)
      .subscribe({
        next: data => {
          this.saving = false;
          this.router.navigate(["..", data.id], {
            relativeTo: this.route
          });
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  private updateSnippet(saveNewVersion: boolean) {
    const hasFieldChanges = SnippetEditComponent.checkFieldChanges(this.oldSnippet, this.snippet);
    const hasGroupChanges = this.entryService.haveGroupsChanged(this.oldSnippet, this.selectedTags, this.selectedCollections);
    let updateCall = this.snippetService.update(this.snippet, hasFieldChanges ? saveNewVersion : false);
    if (hasGroupChanges && !hasFieldChanges) {
      updateCall = this.entryService.updateGroups(this.snippet.id, this.selectedTags, this.selectedCollections);
    }
    updateCall.subscribe({
      next: _ => {
        this.saving = false;
        this.router.navigate([".."], {
          relativeTo: this.route
        });
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  private static checkFieldChanges(oldSnippet: Snippet, newSnippet: NewSnippet): boolean {
    return oldSnippet.plainText !== newSnippet.plainText;
  }

}
