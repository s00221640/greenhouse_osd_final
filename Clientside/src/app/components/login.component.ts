import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2 *ngIf="isLoginMode">Login</h2>
      <h2 *ngIf="!isLoginMode">Sign Up</h2>
      <form (ngSubmit)="onSubmit()" class="login-form">
        <div *ngIf="!isLoginMode" class="form-group">
          <label for="username">Username:</label>
          <input
            type="text"
            [(ngModel)]="username"
            name="username"
            class="form-control"
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            class="form-control"
            placeholder="Enter your email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            class="form-control"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" class="btn btn-primary">
          {{ isLoginMode ? 'Login' : 'Sign Up' }}
        </button>
      </form>
      <button (click)="toggleMode()" class="btn btn-link">
        Switch to {{ isLoginMode ? 'Sign Up' : 'Login' }}
      </button>
      <p *ngIf="errorMessage" class="error text-danger">{{ errorMessage }}</p>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        background-color: #e8f5e9;
        border: 1px solid #c8e6c9;
        border-radius: 8px;
        text-align: center;
      }
      h2 {
        color: #388e3c;
        margin-bottom: 20px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        font-weight: bold;
        color: #2e7d32;
      }
      .form-control {
        padding: 10px;
        border: 1px solid #c8e6c9;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      .btn-primary {
        background-color: #388e3c;
        border: none;
        color: white;
      }
      .btn-link {
        color: #2e7d32;
        text-decoration: underline;
        cursor: pointer;
        background: none;
        border: none;
      }
      .error {
        margin-top: 15px;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class LoginComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  isLoginMode: boolean = true;
  errorMessage: string | null = null;

  private loginUrl = 'http://localhost:3000/users/login';
  private signupUrl = 'http://localhost:3000/users/register';

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(): void {
    const url = this.isLoginMode ? this.loginUrl : this.signupUrl;
    const payload = this.isLoginMode
      ? { email: this.email, password: this.password }
      : { username: this.username, email: this.email, password: this.password };

    console.log('Submitting request:', payload);

    this.http.post<{ token?: string }>(url, payload).subscribe({
      next: (response) => {
        if (this.isLoginMode) {
          localStorage.setItem('token', response.token!);
          console.log('Token stored:', localStorage.getItem('token'));

          // Delay to avoid token read race
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 100);
        } else {
          alert('Signup successful! Please login.');
          this.isLoginMode = true;
        }
      },
      error: (err) => {
        console.error('Error during request:', err);
        this.errorMessage = err.error?.message || 'An error occurred.';
      },
    });
  }
}
