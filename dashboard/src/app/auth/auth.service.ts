import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000/api';

  login(email: string, password: string) {
    return this.http.post<any>(`${this.API}/auth/login`, {
      email,
      password,
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
