import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment.development";
import { Column } from "../types/column.interface";
import { ColumnInput } from "../types/columnInput.interface";
import { SocketEvents } from "../types/socketEvents.enum";
import { SocketService } from "./socket.service";

@Injectable()
export class ColumnsService {
    
    constructor(
        private http: HttpClient,
        private socketService: SocketService
    ) {}

    getColumns(boardId: string): Observable<Column[]> {
        const url = `${environment.apiUrl}/boards/${boardId}/columns`;
        return this.http.get<Column[]>(url);
    }

    createColumn(columnInput: ColumnInput): void {
        this.socketService.emit(SocketEvents.columnsCreate, columnInput)
    }

    deleteColumn(boardId: string, columnId: string) {
        this.socketService.emit(SocketEvents.columnsDelete, { boardId, columnId });
    }

    updateColumn(boardId: string, columnId: string, fields: { title: string }): void {
        this.socketService.emit(SocketEvents.columnsUpdate, { boardId, columnId, fields });
    }
}