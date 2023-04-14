import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { Board } from "src/app/shared/types/board.interface";
import { BoardsService } from "../../shared/services/boards.service";

@Component({
    selector: 'boards',
    templateUrl: './boards.component.html'
})
export class BoardsComponent implements OnInit, OnDestroy {
    private _destroy$: Subject<any> = new Subject<any>();

    boards: Board[] = [];

    constructor(private boardsService: BoardsService) {}

    ngOnInit(): void {
        this.boardsService.getBoards()
            .pipe(
                takeUntil(this._destroy$)
            )
            .subscribe({
                next: (boards: Board[]) => {
                    this.boards = boards;
                    console.log('boards', boards);
                },
                error: (err: HttpErrorResponse) => {

                }
            })
    }

    ngOnDestroy(): void {
        this._destroy$.next(null);
        this._destroy$.complete();
    }

    createBoard(title: string): void {
        console.log('title', title);
        this.boardsService.createBoard(title)
            .pipe(
                takeUntil(this._destroy$)
            )
            .subscribe(createdBoard => {
                this.boards = [...this.boards, createdBoard]
            });
    }
}