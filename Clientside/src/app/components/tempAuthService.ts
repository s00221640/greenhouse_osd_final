import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // '' → same-origin in prod (Railway), http://localhost:3000 in dev
  private readonly API = environment.apiBase || '';
  private readonly usersBase = `${this.API}/users`;

  private readonly tokenKey = 'token';

  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  private loadToken(): void {
    const token = localStorage.getItem(this.tokenKey);

    // Clean up bogus values
    if (!token || token === 'null' || token === 'undefined') {
      localStorage.removeItem(this.tokenKey);
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);
      this.userSubject.next(userData);
    } catch {
      this.clearToken();
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.usersBase}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.usersBase}/login`, credentials).pipe(
      tap(res => {
        if (res?.token) {
          this.saveToken(res.token);
          this.loadToken();
        }
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const t = this.getToken();
    return !!t && t !== 'null' && t !== 'undefined';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getCurrentUserId(): string | null {
    const u = this.userSubject.value;
    return u ? u._id : null;
  }

  getAuthHeaders(): HttpHeaders {
    const t = this.getToken();
    return t && t !== 'null' && t !== 'undefined'
      ? new HttpHeaders({ Authorization: `Bearer ${t}` })
      : new HttpHeaders();
  }

  getUser() {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || token === 'null' || token === 'undefined') return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
