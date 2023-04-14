import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { canActivateRoute } from "../auth/guards/auth.guard";
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopBarModule } from "../shared/modules/topBar/topBar.module";
import { ColumnsService } from "../shared/services/columns.service";
import { TasksService } from "../shared/services/tasks.service";
import { BoardComponent } from "./components/board/board.component";
import { TaskModalComponent } from "./components/taskModal/taskModal.component";
import { BoardService } from "./services/board.service";

const routes: Routes = [
    {
        path: '',
        canActivate: [
            canActivateRoute
        ],
        children: [
            {
                path: 'boards/:boardId',
                component: BoardComponent,
                children: [
                    {
                        path: 'tasks/:taskId',
                        component: TaskModalComponent
                    }
                ]
            }
        ]
    }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TopBarModule,
        InlineFormModule,
        ReactiveFormsModule
    ],
    declarations: [
        BoardComponent,
        TaskModalComponent
    ],
    providers: [
        BoardService,
        ColumnsService,
        TasksService
    ]
})
export class BoardModule {}