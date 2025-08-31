import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../components/tempAuthService';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private readonly API = environment.apiBase || '';

  totalUsers = 0;
  totalPlants = 0;
  groupedData: { email: string, userId: string, plants: any[] }[] = [];
  adminError: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadUsersAndPlants();
  }

  private getAdminHeaders() {
    const adminCode = localStorage.getItem('adminCode');
    if (!adminCode) {
      this.adminError = 'No admin code found. Please verify admin access again.';
      return null;
    }
    return this.authService.getAuthHeaders().set('x-admin-code', adminCode);
  }

  loadStats(): void {
    const headers = this.getAdminHeaders();
    if (!headers) return;

    this.http.get<{ totalUsers: number, totalPlants: number }>(`${this.API}/admin/stats`, { headers })
      .subscribe({
        next: (res) => { 
          this.totalUsers = res.totalUsers; 
          this.totalPlants = res.totalPlants; 
          this.adminError = null;
        },
        error: () => { this.adminError = 'Error fetching stats'; }
      });
  }

  loadUsersAndPlants(): void {
    const headers = this.getAdminHeaders();
    if (!headers) return;

    this.http.get<{ users: any[], plants: any[] }>(`${this.API}/admin/all`, { headers })
      .subscribe({
        next: (res) => {
          this.groupedData = res.users.map(user => ({
            email: user.email,
            userId: user._id,
            plants: res.plants.filter(plant => plant.userEmail === user.email)
          }));
          this.adminError = null;
        },
        error: () => { this.adminError = 'Error fetching users and plants'; }
      });
  }

  deleteUser(userId: string): void {
    const headers = this.getAdminHeaders();
    if (!headers) return;

    this.http.delete(`${this.API}/admin/delete-user/${userId}`, { headers })
      .subscribe({ 
        next: () => {
          this.loadUsersAndPlants();
          this.adminError = null;
        },
        error: () => { this.adminError = 'Error deleting user'; }
      });
  }

  deletePlant(plantId: string): void {
    const headers = this.getAdminHeaders();
    if (!headers) return;

    this.http.delete(`${this.API}/admin/delete-plant/${plantId}`, { headers })
      .subscribe({ 
        next: () => {
          this.loadUsersAndPlants();
          this.adminError = null;
        },
        error: () => { this.adminError = 'Error deleting plant'; }
      });
  }
}