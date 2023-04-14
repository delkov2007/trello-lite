import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { SocketEvents } from '../types/socketEvents.enum';
import { Task } from '../types/task.interface';
import { TaskInput } from '../types/taskInput.interface';
import { SocketService } from './socket.service';

@Injectable()
export class TasksService {
  constructor(private http: HttpClient, private socketService: SocketService) {}

  getTasks(boardId: string): Observable<Task[]> {
    const url = `${environment.apiUrl}/boards/${boardId}/tasks`;
    return this.http.get<Task[]>(url);
  }

  createTask(taskInput: TaskInput): void {
    this.socketService.emit(SocketEvents.tasksCreate, taskInput);
  }

  updateTask(
    boardId: string,
    taskId: string,
    fields: { title?: string; description?: string; columnId?: string }
  ): void {
    this.socketService.emit(SocketEvents.tasksUpdate, { boardId, taskId, fields });
  }

  deleteTask(
    boardId: string,
    taskId: string
  ): void {
    this.socketService.emit(SocketEvents.tasksDelete, { boardId, taskId });
  }
}
