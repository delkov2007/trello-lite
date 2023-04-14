import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { CurrentUser } from 'src/app/auth/types/currentUser.interface';
import { environment } from 'src/environments/environment.development';

@Injectable()
export class SocketService {
  private _socket: Socket | undefined;

  setupSocketConnection(currentUser: CurrentUser): void {
    this._socket = io(environment.socketUrl, {
      auth: {
        token: currentUser.token,
      },
    });
  }

  disconnect(): void {
    if (!this._socket) {
      throw new Error('Socket connection is not established');
    }
    this._socket.disconnect();
  }

  emit(eventName: string, message: any): void {
    if (!this._socket) {
      throw new Error('Socket connection is not established');
    }
    this._socket.emit(eventName, message);
  }

  listen<T>(eventName: string): Observable<T> {
    if (!this._socket) {
      throw new Error('Socket connection is not established');
    }

    return new Observable((subscriber) => {
      this._socket!.on(eventName, (data) => {
        subscriber.next(data)
      })
    })
  }
}
