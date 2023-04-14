import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { Board } from 'src/app/shared/types/board.interface';
import { Column } from 'src/app/shared/types/column.interface';
import { SocketEvents } from 'src/app/shared/types/socketEvents.enum';
import { Task } from 'src/app/shared/types/task.interface';

@Injectable()
export class BoardService {
  private _board$: BehaviorSubject<Board | null> =
    new BehaviorSubject<Board | null>(null);
  private _columns$: BehaviorSubject<Column[]> = new BehaviorSubject<Column[]>([]);
  private _tasks$: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  board$: Observable<Board | null> = this._board$.asObservable();
  columns$: Observable<Column[]> = this._columns$.asObservable();
  tasks$: Observable<Task[]> = this._tasks$.asObservable();

  constructor(private socketService: SocketService) {}

  setBoard(board: Board | null): void {
    this._board$.next(board);
  }

  setColumns(columns: Column[]): void {
    this._columns$.next(columns);
  }

  addColumn(column: Column): void {
    const updatedColumns = [...this._columns$.getValue(), column];
    this._columns$.next(updatedColumns);
  }

  setTasks(tasks: Task[]): void {
    this._tasks$.next(tasks);
  }

  addTask(task: Task): void {
    const updatedTasks = [...this._tasks$.getValue(), task];
    this._tasks$.next(updatedTasks);
  }

  updateBoard(updatedBoard: Board): void {
    const board = this._board$.getValue();
    if (!board) {
      throw new Error('Board is not initialized');
    }
    this._board$.next({...board, title: updatedBoard.title });
  }

  deleteColumn(columnId: string): void {
    const updatedColumns = this._columns$.getValue().filter(c => c.id !== columnId);
    this._columns$.next(updatedColumns);
  }

  updateColumn(updatedColumn: Column): void {
    const updateColumns = this._columns$.getValue().map(column => {
      if (column.id === updatedColumn.id) {
        return {...column, title: updatedColumn.title };
      }
      return column;
    });
    this._columns$.next(updateColumns);
  }

  updateTask(updatedTask: Task): void {
    const updatedTasks = this._tasks$.getValue().map(task => {
      if (task.id === updatedTask.id) {
        return {...task, title: updatedTask.title, description: updatedTask.description, columnId: updatedTask.columnId };
      }
      return task;
    })
    this._tasks$.next(updatedTasks);
  }

  leaveBoard(boardId: string): void {
    this._board$.next(null);
    this.socketService.emit(SocketEvents.boardsLeave, { boardId: boardId });
  }

  deleteTask(taskId: string): void {
    const updatedTasks = this._tasks$.getValue().filter(t => t.id !== taskId);
    this._tasks$.next(updatedTasks);
  }
}
