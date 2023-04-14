import { Component, HostBinding, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { SocketService } from 'src/app/shared/services/socket.service';
import { TasksService } from 'src/app/shared/services/tasks.service';
import { Column } from 'src/app/shared/types/column.interface';
import { SocketEvents } from 'src/app/shared/types/socketEvents.enum';
import { Task } from 'src/app/shared/types/task.interface';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'task-modal',
  templateUrl: './taskModal.component.html',
})
export class TaskModalComponent implements OnDestroy {
  @HostBinding('class') classes = 'task-modal';

  boardId: string;
  taskId: string;
  data$: Observable<{
    task: Task;
    columns: Column[];
  }>;
  form!: FormGroup;

  private _destroy: Subject<any> = new Subject<any>();
  private _task$: Observable<Task>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private fb: FormBuilder,
    private tasksService: TasksService,
    private socketService: SocketService
  ) {
    this.boardId = this.route.parent?.snapshot.paramMap.get('boardId') || '';
    if (!this.boardId) throw new Error('Can`t get board id');

    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';
    if (!this.taskId) throw new Error('Can`t get task id');

    this.initForms();

    this._task$ = this.boardService.tasks$.pipe(
      map((tasks) => {
        return tasks.find((task) => task.id === this.taskId);
      }),
      filter(Boolean)
    );
    this.data$ = combineLatest([this._task$, this.boardService.columns$]).pipe(
      takeUntil(this._destroy),
      tap(([task]) => {
        this.form.patchValue({ columnId: task.columnId });
      }),
      map(([task, columns]) => ({
        task,
        columns,
      }))
    );

    combineLatest([this._task$, this.form.get('columnId')!.valueChanges])
      .pipe(takeUntil(this._destroy))
      .subscribe(([task, selectedColumnId]) => {
        if (task.columnId !== selectedColumnId) {
          this.updateTaskColumnId(selectedColumnId);
        }
      });

    this.socketService
      .listen<string>(SocketEvents.tasksDeleteSuccess)
      .pipe(takeUntil(this._destroy))
      .subscribe(_ => {
        this.goToBoard();
      })
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

  goToBoard(): void {
    this.router.navigate(['boards', this.boardId]);
  }

  updateTaskName(taskName: string) {
    this.tasksService.updateTask(this.boardId, this.taskId, {
      title: taskName,
    });
  }

  updateTaskDescription(taskDescription: string): void {
    this.tasksService.updateTask(this.boardId, this.taskId, {
      description: taskDescription,
    });
  }

  updateTaskColumnId(columnId: string): void {
    this.tasksService.updateTask(this.boardId, this.taskId, {
      columnId: columnId,
    });
  }

  deleteTask(): void {
    debugger
    if (confirm('Are you sure you want to delete the task?')) {
        this.tasksService.deleteTask(this.boardId, this.taskId);
    }
  }

  private initForms(): void {
    this.form = this.fb.group({
      columnId: [null],
    });
  }
}
