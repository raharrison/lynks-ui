import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {LoadingStatus} from "@shared/models/loading-status.model";
import {Collection, EntryType, File, NewFile, Tag} from "@shared/models";
import {ActivatedRoute, Router} from "@angular/router";
import {FileService} from "@app/entry/services/file.service";
import {AttachmentUploadComponent} from "@app/attachment/components";
import {EntryService} from "@app/entry/services/entry.service";

@Component({
  selector: 'lks-file-edit',
  templateUrl: './file-edit.component.html',
  styleUrls: ['./file-edit.component.scss']
})
export class FileEditComponent implements OnInit, AfterViewInit {

  @ViewChild(AttachmentUploadComponent) uploadComponent: AttachmentUploadComponent;

  EntryType = EntryType;

  loadingStatus: LoadingStatus = LoadingStatus.LOADED;
  saving = false;
  updateMode = false;

  file: NewFile;
  private oldFile: File;
  isFileSelected: boolean;

  selectedTags: Tag[] = [];
  selectedCollections: Collection[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private entryService: EntryService,
              private fileService: FileService) {
  }

  ngOnInit() {
    this.file = {
      id: null,
      title: "",
      tags: [],
      collections: []
    };
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.updateMode = true;
      this.loadingStatus = LoadingStatus.LOADING;
      this.fileService.get(id).subscribe({
        next: data => {
          this.oldFile = data;
          this.file.id = data.id;
          this.file.title = data.title;
          this.selectedTags = data.tags;
          this.selectedCollections = data.collections;
          this.loadingStatus = LoadingStatus.LOADED;
        }, error: () => {
          this.loadingStatus = LoadingStatus.ERROR;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // in edit mode no upload component present
    if (!this.uploadComponent) {
      return;
    }
    // setup subscription to file upload completion
    this.uploadComponent.attachmentUploaded.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(["..", this.file.id], {
          relativeTo: this.route
        });
      },
      error: () => this.saving = false
    });
  }

  onSubmit(saveNewVersion: boolean) {
    this.file.tags = this.selectedTags.map(t => t.id);
    this.file.collections = this.selectedCollections.map(c => c.id);
    this.saving = true;
    if (this.updateMode) {
      this.updateFile(saveNewVersion);
    } else {
      this.createFile();
    }
  }

  onFileSelected(filename: string) {
    this.file.title = filename;
    this.isFileSelected = !!filename;
  }

  private createFile() {
    // already create new file, just upload file
    if (this.file.id) {
      this.uploadComponent.onSubmit();
    } else {
      this.fileService.create(this.file)
        .subscribe({
          next: data => {
            this.file.id = data.id;
            this.uploadComponent.entryId = this.file.id;
            // trigger file upload and monitor for completion
            this.uploadComponent.onSubmit();
          },
          error: () => {
            this.saving = false;
          }
        });
    }
  }

  private updateFile(saveNewVersion: boolean) {
    const hasFieldChanges = FileEditComponent.checkFieldChanges(this.oldFile, this.file);
    const hasGroupChanges = this.entryService.haveGroupsChanged(this.oldFile, this.selectedTags, this.selectedCollections);
    let updateCall = this.fileService.update(this.file, hasFieldChanges ? saveNewVersion : false);
    if (hasGroupChanges && !hasFieldChanges) {
      updateCall = this.entryService.updateGroups(this.file.id, this.selectedTags, this.selectedCollections);
    }
    updateCall.subscribe({
      next: () => {
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

  private static checkFieldChanges(oldFile: File, newFile: NewFile): boolean {
    return oldFile.title !== newFile.title;
  }

}
