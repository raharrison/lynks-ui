import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Attachment} from "../model/attachment.model";
import {ToastrService} from "ngx-toastr";
import {tap} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class AttachmentService {

    constructor(private http: HttpClient,
                private toastrService: ToastrService) {
    }

    getAttachmentsForEntry(entryId: string): Observable<Attachment[]> {
        return this.http.get<Attachment[]>(`/api/entry/${entryId}/resources`);
    }

    createDownloadLink(entryId: string, attachmentId: string): string {
        return `/api/entry/${entryId}/resources/${attachmentId}`;
    }

    uploadAttachment(entryId: string, file: File): Observable<Attachment> {
        const formData: FormData = new FormData();
        formData.append('fileKey', file, file.name);
        return this.http.post<Attachment>(`/api/entry/${entryId}/resources/`, formData)
            .pipe(tap(_ => {
                this.toastrService.info("Attachment uploaded", "Success");
            }));
    }

    deleteAttachment(entryId: string, attachmentId: string): Observable<any> {
        return this.http.delete(`/api/entry/${entryId}/resources/${attachmentId}`)
            .pipe(tap(_ => {
                this.toastrService.info("Attachment deleted", "Success");
            }));
    }

}
