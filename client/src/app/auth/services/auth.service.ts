import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, Observable } from "rxjs";
import { CurrentUser } from "../types/currentUser.interface";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment.development";
import { RegisterRequest } from "../types/registerRequest.interface";
import { LoginResponse } from "../types/loginRequest.interface";
import { SocketService } from "src/app/shared/services/socket.service";

@Injectable()
export class AuthService {
    currentUser$ = new BehaviorSubject<CurrentUser | null | undefined>(undefined);
    isLoggedIn$ = this.currentUser$
        .pipe(
            filter(currentUser => currentUser !== undefined),
            map(Boolean)
        );

    constructor(
        private http: HttpClient,
        private socketService: SocketService
    ) {}

    getCurrentUser(): Observable<CurrentUser> {
        const url = `${environment.apiUrl}/users`
        return this.http.get<CurrentUser>(url);
    }

    register(registerRequest: RegisterRequest): Observable<CurrentUser> {
        const url = `${environment.apiUrl}/users`;
        return this.http.post<CurrentUser>(url, registerRequest);
    }

    login(loginRequest: LoginResponse): Observable<CurrentUser> {
        const url = `${environment.apiUrl}/users/login`;
        return this.http.post<CurrentUser>(url, loginRequest);
    }

    logout(): void {
        localStorage.removeItem('token');
        this.currentUser$.next(null);
        this.socketService.disconnect();
    }

    canActivate(): Observable<boolean> {
        return this.isLoggedIn$
    }

    setCurrentUser(currentUser: CurrentUser | null): void {
        this.currentUser$.next(currentUser);
    }

    setToken(currentUser: CurrentUser): void {
        localStorage.setItem('token', currentUser.token);
    }
}