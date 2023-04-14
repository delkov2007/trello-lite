import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { CurrentUser } from './auth/types/currentUser.interface';
import { SocketService } from './shared/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) {}
  
  ngOnInit(): void {
    this.authService.getCurrentUser()
      .subscribe({
        next: (currentUser: CurrentUser) => {
          this.socketService.setupSocketConnection(currentUser);
          this.authService.setCurrentUser(currentUser);
        },
        error: (err) => {
          console.log('err', err);
          this.authService.setCurrentUser(null);
        }
      })
  }
}
