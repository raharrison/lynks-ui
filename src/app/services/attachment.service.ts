import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
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

    getAttachment(entryId: string, attachmentId: string): Observable<HttpResponse<Attachment>> {
        return this.http.get<Attachment>(this.createDownloadLink(entryId, attachmentId) + "/info",
            { observe: "response" });
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

    downloadAttachment(entryId: string, attachmentId: string): Observable<any> {
        return this.http.get(this.createDownloadLink(entryId, attachmentId), {
            responseType: "blob"
        });
    }

    deleteAttachment(entryId: string, attachmentId: string): Observable<any> {
        return this.http.delete(`/api/entry/${entryId}/resources/${attachmentId}`)
            .pipe(tap(_ => {
                this.toastrService.info("Attachment deleted", "Success");
            }));
    }

}
