import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {Note} from "../../../model/note.model";

@Component({
    selector: 'app-note-list',
    templateUrl: './note-list.component.html',
    styleUrls: ['./note-list.component.css']
})
export class NoteListComponent implements OnInit {

    notes: Note[];

    constructor(private httpClient: HttpClient) {
    }

    ngOnInit() {
        this.httpClient.get<Array<Note>>("/api/note").subscribe((data) => {
            this.notes = data;
        });

    }

}
