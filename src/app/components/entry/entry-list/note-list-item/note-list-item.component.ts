import {Component, Input, OnInit} from '@angular/core';
import {SlimNote} from "../../../../model/note.model";

@Component({
  selector: 'app-note-list-item',
  templateUrl: './note-list-item.component.html',
  styleUrls: ['./note-list-item.component.css']
})
export class NoteListItemComponent implements OnInit {

  @Input()
  note: SlimNote;

  constructor() {
  }

  ngOnInit() {
  }

}
