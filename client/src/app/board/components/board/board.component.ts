import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
} from 'rxjs';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { ColumnsService } from 'src/app/shared/services/columns.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { TasksService } from 'src/app/shared/services/tasks.service';
import { Board } from 'src/app/shared/types/board.interface';
import { Column } from 'src/app/shared/types/column.interface';
import { ColumnInput } from 'src/app/shared/types/columnInput.interface';
import { SocketEvents } from 'src/app/shared/types/socketEvents.enum';
import { Task } from 'src/app/shared/types/task.interface';
import { TaskInput } from 'src/app/shared/types/taskInput.interface';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit, OnDestroy {
  private _destroy$: Subject<any> = new Subject<any>();
  private boardId: string;
  data$: Observable<{
    board: Board;
    columns: Column[];
    tasks: Task[];
  }>;

  constructor(
    private boardsService: BoardsService,
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private socketService: SocketService,
    private columnsService: ColumnsService,
    private taskService: TasksService
  ) {
    const boardId = this.route.snapshot.paramMap.get('boardId');
    if (!boardId) throw new Error('Can get boardId from url');
    this.boardId = boardId;
    this.data$ = combineLatest([
      this.boardService.board$.pipe(filter(Boolean)),
      this.boardService.columns$,
      this.boardService.tasks$,
    ]).pipe(map(([board, columns, tasks]) => ({ board, columns, tasks })));
  }

  ngOnInit(): void {
    this.socketService.emit(SocketEvents.boardsJoin, { boardId: this.boardId });
    this.getBoard();
    this.getColumns();
    this.getTasks();
    this.initializeListeners();
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  createColumn(title: string): void {
    const columnInput: ColumnInput = {
      title,
      boardId: this.boardId,
    };
    this.columnsService.createColumn(columnInput);
  }

  createTask(title: string, columnId: string): void {
    const taskInput: TaskInput = {
      title,
      boardId: this.boardId,
      columnId: columnId,
    };
    this.taskService.createTask(taskInput);
  }

  updateBoardName(boardName: string): void {
    this.boardsService.updateBoard(this.boardId, { title: boardName });
  }

  updateColumnName(columnName: string, columnId: string): void {
    this.columnsService.updateColumn(this.boardId, columnId, {
      title: columnName,
    });
  }

  deleteColumn(columnId: string): void {
    if (confirm('Are you sure you want to delete the column?')) {
      this.columnsService.deleteColumn(this.boardId, columnId);
    }
  }

  deleteBoard(): void {
    if (confirm('Are you sure you want to delete the board?')) {
      this.boardsService.deleteBoard(this.boardId);
    }
  }

  getTaskByColumn(columnId: string, tasks: Task[]): Task[] {
    return tasks.filter((t) => t.columnId === columnId);
  }

  openTask(taskId: string): void {
    this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
  }

  private getBoard(): void {
    this.boardsService
      .getBoard(this.boardId)
      .pipe(takeUntil(this._destroy$))
      .subscribe((board) => {
        //console.log('board', board);
        this.boardService.setBoard(board);
      });
  }

  private getColumns(): void {
    this.columnsService
      .getColumns(this.boardId)
      .pipe(takeUntil(this._destroy$))
      .subscribe((columns) => {
        //console.log('columns', columns);
        this.boardService.setColumns(columns);
      });
  }

  private getTasks(): void {
    this.taskService
      .getTasks(this.boardId)
      .pipe(takeUntil(this._destroy$))
      .subscribe((tasks) => {
        this.boardService.setTasks(tasks);
      });
  }

  private initializeListeners(): void {
    this.router.events.pipe(takeUntil(this._destroy$)).subscribe((event) => {
      if (event instanceof NavigationStart && !event.url.includes('/boards/')) {
        console.log('leaving board page');
        this.boardService.leaveBoard(this.boardId);
      }
    });

    this.socketService
      .listen<Column>(SocketEvents.columnsCreateSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((column) => {
        this.boardService.addColumn(column);
      });

    this.socketService
      .listen<Task>(SocketEvents.tasksCreateSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((task) => {
        this.boardService.addTask(task);
      });

    this.socketService
      .listen<Task>(SocketEvents.tasksUpdateSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((task) => {
        this.boardService.updateTask(task);
      });

    this.socketService
      .listen<string>(SocketEvents.tasksDeleteSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((taskId) => {
        this.boardService.deleteTask(taskId);
      });

    this.socketService
      .listen<Board>(SocketEvents.boardsUpdateSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((board) => {
        this.boardService.updateBoard(board);
      });

    this.socketService
      .listen<void>(SocketEvents.boardsDeleteSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.router.navigateByUrl('/boards');
      });

    this.socketService
      .listen<string>(SocketEvents.columnsDeleteSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((columnId) => {
        this.boardService.deleteColumn(columnId);
      });

    this.socketService
      .listen<Column>(SocketEvents.columnsUpdateSuccess)
      .pipe(takeUntil(this._destroy$))
      .subscribe((updateColumn) => {
        this.boardService.updateColumn(updateColumn);
      });
  }
}
