import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private tokenKey = 'token';
  
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { 
    this.loadToken();
  }

  private loadToken(): void {
    const token = localStorage.getItem(this.tokenKey);
    
    // Don't try to parse invalid tokens
    if (!token || token === 'null' || token === 'undefined') {
      console.log('No valid token found');
      localStorage.removeItem(this.tokenKey); // Clean up invalid tokens
      return;
    }
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userData = JSON.parse(jsonPayload);
      this.userSubject.next(userData);
      console.log('User loaded from token:', userData);
    } catch (e) {
      console.error('Error parsing token', e);
      this.clearToken();
    }
  }

  register(userData: any): Observable<any> {
    console.log('Registering user:', userData);
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    console.log('Attempting login with:', credentials.email);
    return this.http.post<any>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          if (response && response.token) {
            console.log('Saving token to localStorage');
            this.saveToken(response.token);
            this.loadToken();
          }
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    this.clearToken();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && token !== 'null' && token !== 'undefined';
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
    const user = this.userSubject.value;
    return user ? user._id : null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    // Only set Authorization header if token is valid
    if (token && token !== 'null' && token !== 'undefined') {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  getUser() {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error parsing token for user data', e);
      return null;
    }
  }
}