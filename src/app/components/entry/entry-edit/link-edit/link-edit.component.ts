import {Component, OnInit} from '@angular/core';
import {Collection, Grouping, Tag} from "../../../../model/group.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NewLink} from "../../../../model/link.model";
import {LinkService} from "../../../../services/link.service";

@Component({
  selector: 'app-link-edit',
  templateUrl: './link-edit.component.html',
  styleUrls: ['./link-edit.component.css']
})
export class LinkEditComponent implements OnInit {

  loading = false;
  saving = false;
  suggesting = false;

  updateMode = false;
  suggestionThumbnail: string;
  suggestionKeywords: string[] = [];
  link: NewLink;

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
      // update mode
      this.updateMode = true;
      this.loading = true;
      this.link.process = false;
      this.linkService.get(id).subscribe((data) => {
        this.link.id = data.id;
        this.link.title = data.title;
        this.link.url = data.url;
        this.selectedTags = data.tags;
        this.selectedCollections = data.collections;
        this.loading = false;
      });
    }
  }

  onSuggest() {
    this.suggesting = true;
    this.linkService.suggest(this.link.url).subscribe(suggestion => {
      this.suggesting = false;
      this.link.title = suggestion.title;
      this.suggestionThumbnail = this.linkService.constructTempUrl(suggestion.thumbnail);
      this.suggestionKeywords = suggestion.keywords;
      this.addSuggestedGroupings(suggestion.tags, this.selectedTags);
      this.addSuggestedGroupings(suggestion.collections, this.selectedCollections);
    }, () => {
      this.suggesting = false;
    });
  }

  private addSuggestedGroupings(suggestedGroups: Grouping<any>[], target: Grouping<any>[]) {
    const selectedIds = new Set(target.map(t => t.id));
    suggestedGroups.forEach(value => {
      if (!selectedIds.has(value.id)) {
        target.push(value);
      }
    });
  }

  onCancel() {
    if (this.updateMode) {
      this.router.navigate(["/links", this.link.id]);
    } else {
      this.router.navigate(["/links"]);
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

  createLink() {
    this.linkService.create(this.link)
      .subscribe(
        data => {
          this.saving = false;
          this.router.navigate(["/links", data.id]);
        }, () => {
          this.saving = false;
        });
  }

  updateLink() {
    this.linkService.update(this.link)
      .subscribe(
        data => {
          this.saving = false;
          this.router.navigate(["/links", data.id]);
        }, () => {
          this.saving = false;
        });
  }

}
