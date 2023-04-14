import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {

    private _destroy$: Subject<any> = new Subject<any>();

    constructor (
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.authService.isLoggedIn$
            .pipe(
                takeUntil(this._destroy$)
            )
            .subscribe(isLoggedIn => {
                if (isLoggedIn) {
                    this.router.navigateByUrl('/boards')
                }
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next(null);
        this._destroy$.complete();
    }
}