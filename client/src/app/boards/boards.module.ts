import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { canActivateRoute } from "../auth/guards/auth.guard";
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopBarModule } from "../shared/modules/topBar/topBar.module";
import { BoardsComponent } from "./components/boards.component";
import { BoardsService } from "../shared/services/boards.service";

const routes: Routes = [
    {
        path: '',
        canActivate: [canActivateRoute],
        children: [
            {
                path: 'boards',
                component: BoardsComponent,
            }
        ]
    }
]

@NgModule({
    declarations: [BoardsComponent],
    providers: [
        BoardsService
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        InlineFormModule,
        TopBarModule
    ]
})
export class BoardsModule {}