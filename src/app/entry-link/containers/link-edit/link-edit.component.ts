import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, Grouping, GroupType, Link, NewLink, SlimLink, Tag} from "@shared/models";
import {LinkService} from "@app/entry/services/link.service";
import {debounceTime, distinctUntilChanged, Subject, Subscription} from "rxjs";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-link-edit',
  templateUrl: './link-edit.component.html',
  styleUrls: ['./link-edit.component.scss']
})
export class LinkEditComponent implements OnInit, OnDestroy {

  loadingStatus: LoadingStatus = LoadingStatus.LOADED;
  saving = false;
  suggesting = false;

  updateMode = false;
  suggestionThumbnail: string;
  suggestionKeywords: string[] = [];

  urlFieldChanged = new Subject<string>();
  private urlFieldChangedSubscription: Subscription;
  existingLinks: SlimLink[] = [];

  link: NewLink;
  private oldLink: Link;

  selectedTags: Tag[] = [];
  selectedCollections: Collection[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private linkService: LinkService) {
  }

  ngOnInit(): void {
    this.link = {
      id: null,
      title: "",
      tags: [],
      collections: [],
      process: true,
      url: ""
    };
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.updateMode = true;
      this.loadingStatus = LoadingStatus.LOADING;
      this.link.process = false;
      this.linkService.get(id).subscribe({
        next: data => {
          this.oldLink = data;
          this.link.id = data.id;
          this.link.title = data.title;
          this.link.url = data.url;
          this.selectedTags = data.tags;
          this.selectedCollections = data.collections;
          this.loadingStatus = LoadingStatus.LOADED;
        }, error: () => this.loadingStatus = LoadingStatus.ERROR
      });
    }
    this.urlFieldChangedSubscription = this.urlFieldChanged.pipe(
      debounceTime(500),
      distinctUntilChanged())
      .subscribe(url => this.onCheckExisting(url));
  }

  onSuggest() {
    this.suggesting = true;
    this.linkService.suggest(this.link.url).subscribe({
      next: suggestion => {
        this.suggesting = false;
        this.link.title = suggestion.title;
        this.suggestionThumbnail = suggestion.thumbnail ? this.linkService.constructTempUrl(suggestion.thumbnail) : null;
        this.suggestionKeywords = suggestion.keywords;
        this.addSuggestedGroupings(suggestion.tags, GroupType.TAG);
        this.addSuggestedGroupings(suggestion.collections, GroupType.COLLECTION);
      },
      error: () => {
        this.suggesting = false;
      }
    });
  }

  private addSuggestedGroupings(suggestedGroups: Grouping<any>[], type: GroupType) {
    const target = type == GroupType.TAG ? this.selectedTags : this.selectedCollections;
    const selectedIds = new Set(target.map(t => t.id));
    suggestedGroups.forEach(value => {
      if (!selectedIds.has(value.id)) {
        target.push(value);
      }
    });
    if (type == GroupType.TAG) this.selectedTags = [...target];
    else if (type == GroupType.COLLECTION) this.selectedCollections = [...target];
  }

  private onCheckExisting(url: string) {
    if (url) {
      this.linkService.checkExistingWithUrl(url).subscribe(existing => this.existingLinks = existing);
    } else {
      this.existingLinks = [];
    }
  }

  onCancel() {
    if (this.updateMode) {
      this.router.navigate(["/entries/links", this.link.id]);
    } else {
      this.router.navigate(["/entries/links"]);
    }
  }

  onSubmit() {
    if (this.link.title == "") {
      this.link.title = this.link.url;
    }
    this.link.tags = this.selectedTags.map(t => t.id);
    this.link.collections = this.selectedCollections.map(c => c.id);
    this.saving = true;
    if (this.updateMode) {
      this.updateLink();
    } else {
      this.createLink();
    }
  }

  private createLink() {
    this.linkService.create(this.link)
      .subscribe({
        next: data => {
          this.saving = false;
          this.router.navigate(["/links", data.id]);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  private updateLink() {
    // only save new version if main fields have changed
    const forceNewVersion = LinkEditComponent.checkFieldChanges(this.oldLink, this.link);
    this.linkService.update(this.link, forceNewVersion)
      .subscribe({
        next: data => {
          this.saving = false;
          this.router.navigate(["/links", data.id]);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  private static checkFieldChanges(oldLink: Link, newLink: NewLink): boolean {
    if (oldLink.title !== newLink.title) return true;
    else if (oldLink.url !== newLink.url) return true;
    return false;
  }

  ngOnDestroy(): void {
    if (this.urlFieldChangedSubscription != null) {
      this.urlFieldChangedSubscription.unsubscribe();
    }
  }

}
