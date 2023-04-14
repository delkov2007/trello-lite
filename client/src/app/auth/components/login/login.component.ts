import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { SocketService } from "src/app/shared/services/socket.service";
import { AuthService } from "../../services/auth.service";
import { CurrentUser } from "../../types/currentUser.interface";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {
    form!: FormGroup;
    errorMessage: string | null = null;
    private _destroy$: Subject<any> = new Subject<any>();

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private socketService: SocketService
    ) {
        this.initForm();
    }

    ngOnDestroy(): void {
        this._destroy$.next(null);
        this._destroy$.complete();
    }

    onSubmit(e: any) {
        e.preventDefault();
        this.authService.login(this.form.value)
            .pipe(
                takeUntil(this._destroy$)
            )
            .subscribe({
                next: (currentUser: CurrentUser) => {
                    console.log('login user', currentUser);
                    this.authService.setToken(currentUser);
                    this.socketService.setupSocketConnection(currentUser);
                    this.authService.setCurrentUser(currentUser)
                    this.errorMessage = null;
                    this.router.navigateByUrl('/');
                },
                error: (err: HttpErrorResponse) => {
                    console.log('login err', err);
                    this.errorMessage = Object.values(err.error).join(', ');
                }
            })
    }

    private initForm() {
        this.form = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        })
    }
}