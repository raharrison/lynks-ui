import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {Attachment} from "../model/attachment.model";
import {ResponseHandlerService} from "./response-handler.service";

@Injectable({
    providedIn: 'root'
})
export class AttachmentService {

    constructor(private http: HttpClient,
                private responseHandler: ResponseHandlerService) {
    }

    getAttachmentsForEntry(entryId: string): Observable<Attachment[]> {
        return this.http.get<Attachment[]>(`/api/entry/${entryId}/resources`)
            .pipe(this.responseHandler.handleResponseError("Unable to retrieve attachments for entry"));
    }

    getAttachment(entryId: string, attachmentId: string): Observable<HttpResponse<Attachment>> {
        return this.http.get<Attachment>(this.createDownloadLink(entryId, attachmentId) + "/info",
            { observe: "response" })
            .pipe(this.responseHandler.handleResponseError("Unable to retrieve attachment"));
    }

    createDownloadLink(entryId: string, attachmentId: string): string {
        return `/api/entry/${entryId}/resources/${attachmentId}`;
    }

    uploadAttachment(entryId: string, file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('fileKey', file, file.name);
        return this.http.post<Attachment>(`/api/entry/${entryId}/resources/`, formData, {
            reportProgress: true,
            observe: "events"
        })
        .pipe(this.responseHandler.handleResponseFilter(e => e.type == HttpEventType.Response,
            "Attachment uploaded", "Unable to upload attachment"));
    }

    updateAttachment(entryId: string, attachment: Attachment): Observable<Attachment> {
        return this.http.put<Attachment>(`/api/entry/${entryId}/resources`, attachment)
            .pipe(this.responseHandler.handleResponse("Attachment updated", "Unable to update attachment"));
    }

    downloadAttachment(entryId: string, attachmentId: string): Observable<any> {
        return this.http.get(this.createDownloadLink(entryId, attachmentId), {
            responseType: "blob"
        })
        .pipe(this.responseHandler.handleResponseError("Unable to download attachment"));
    }

    deleteAttachment(entryId: string, attachmentId: string): Observable<any> {
        return this.http.delete(`/api/entry/${entryId}/resources/${attachmentId}`)
            .pipe(this.responseHandler.handleResponse("Attachment deleted", "Unable to delete attachment"));
    }

}
