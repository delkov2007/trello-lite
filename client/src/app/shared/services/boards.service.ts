import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Board } from 'src/app/shared/types/board.interface';
import { environment } from 'src/environments/environment.development';
import { SocketEvents } from '../types/socketEvents.enum';
import { SocketService } from './socket.service';

@Injectable()
export class BoardsService {

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  getBoards(): Observable<Board[]> {
    const url = `${environment.apiUrl}/boards`;
    return this.http.get<Board[]>(url);
  }

  getBoard(boardId: string): Observable<Board> {
    const url = `${environment.apiUrl}/boards/${boardId}`;
    return this.http.get<Board>(url);
  }

  createBoard(title: string): Observable<Board> {
    const url = `${environment.apiUrl}/boards`;
    return this.http.post<Board>(url, { title });
  }

  updateBoard(boardId: string, fields: { title: string}): void {
    this.socketService.emit(SocketEvents.boardsUpdate, { boardId, fields });
  }

  deleteBoard(boardId: string): void {
    this.socketService.emit(SocketEvents.boardsDelete, { boardId });
  }
}
