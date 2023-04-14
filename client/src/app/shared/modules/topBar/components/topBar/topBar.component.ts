import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/services/auth.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './topBar.component.html'
})
export class TopBarComponent {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    logout() {
        this.authService.logout();
        this.router.navigateByUrl('/');
    }
}