import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './components/tempAuthService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  template: `
    <nav *ngIf="authService.isLoggedIn()" style="display: flex; justify-content: center; background-color: #d8f3dc; padding: 10px;">
      <a routerLink="/" style="text-decoration: none; color: #2d6a4f; font-size: 1.2rem; font-weight: bold; margin-right: 20px;">Home</a>
      <a routerLink="/create" style="text-decoration: none; color: #2d6a4f; font-size: 1.2rem; font-weight: bold; margin-right: 20px;">Create Plant</a>
      <a routerLink="/almanac" style="text-decoration: none; color: #2d6a4f; font-size: 1.2rem; font-weight: bold; margin-right: 20px;">Almanac</a>

      <a *ngIf="isAdmin" routerLink="/admin" style="text-decoration: none; color: #ff6b6b; font-size: 1.2rem; font-weight: bold; margin-right: 20px;">Admin Dashboard</a>

      <button 
        *ngIf="!isAdmin"
        (click)="showAdminPrompt = true"
        style="margin-right: 20px; background-color: #74c69d; border: none; padding: 5px 10px; color: white; font-size: 1rem; border-radius: 5px;"
      >
        Enter Admin Code
      </button>

      <div *ngIf="currentUser" style="margin-right: 20px; color: #2d6a4f; font-size: 1rem; display: flex; align-items: center;">
        <span>Logged in as: <strong>{{ currentUser.email }}</strong></span>
      </div>

      <button (click)="logout()" style="background-color: #95d5b2; border: none; padding: 5px 10px; color: #fff; font-size: 1rem; cursor: pointer; border-radius: 5px;">Logout</button>
    </nav>

    <!-- Admin Code Modal -->
    <div *ngIf="showAdminPrompt" style="position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); z-index: 1000;">
      <h3>Enter Admin Code</h3>
      <input type="password" [(ngModel)]="adminCode" placeholder="Admin Code" class="form-control" style="margin-bottom: 10px;" />
      <div *ngIf="adminError" style="color: red; margin-bottom: 10px;">{{ adminError }}</div>
      <button (click)="verifyAdminCode()" class="btn btn-success" style="margin-right: 10px;">Submit</button>
      <button (click)="showAdminPrompt = false" class="btn btn-secondary">Cancel</button>
    </div>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  currentUser: any = null;
  showAdminPrompt = false;
  adminCode = '';
  adminError: string | null = null;
  isAdmin = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Check if the user is logged in, redirect to login if not
  checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    // Clear invalid tokens
    if (token === 'null' || token === 'undefined') {
      localStorage.removeItem('token');
    }
    
    if (!this.authService.isLoggedIn()) {
      console.log('Not logged in, redirecting to login page');
      this.router.navigate(['/login']);
    } else {
      this.loadUserInfo();
    }
  }

  loadUserInfo() {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        this.currentUser = JSON.parse(jsonPayload);
        console.log('User info loaded:', this.currentUser);
      } catch (e) {
        console.error('Error parsing token', e);
        this.currentUser = null;
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.clearToken();
    this.currentUser = null;
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }

  verifyAdminCode(): void {
    const headers = this.authService.getAuthHeaders().set('x-admin-code', this.adminCode);
    this.http.get<{ totalUsers: number, totalPlants: number }>('http://localhost:3000/admin/stats', { headers }).subscribe({
      next: () => {
        this.isAdmin = true;
        this.showAdminPrompt = false;
        this.adminError = null;
      },
      error: () => {
        this.adminError = 'Incorrect admin code';
      }
    });
  }
}