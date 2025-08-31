import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../components/tempAuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  totalPlants = 0;
  groupedData: { email: string, userId: string, plants: any[] }[] = [];
  adminError: string | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadUsersAndPlants();
  }

  loadStats(): void {
    const headers = this.authService.getAuthHeaders().set('x-admin-code', 'letmein2025');
    this.http.get<{ totalUsers: number, totalPlants: number }>('http://localhost:3000/admin/stats', { headers }).subscribe({
      next: (res) => {
        this.totalUsers = res.totalUsers;
        this.totalPlants = res.totalPlants;
      },
      error: () => {
        this.adminError = 'Error fetching stats';
      }
    });
  }

  loadUsersAndPlants(): void {
    const headers = this.authService.getAuthHeaders().set('x-admin-code', 'letmein2025');
    this.http.get<{ users: any[], plants: any[] }>('http://localhost:3000/admin/all', { headers }).subscribe({
      next: (res) => {
        this.groupedData = res.users.map(user => ({
          email: user.email,
          userId: user._id,
          plants: res.plants.filter(plant => plant.userEmail === user.email)
        }));
      },
      error: () => {
        this.adminError = 'Error fetching users and plants';
      }
    });
  }

  deleteUser(userId: string): void {
    const headers = this.authService.getAuthHeaders().set('x-admin-code', 'letmein2025');
    this.http.delete(`http://localhost:3000/admin/delete-user/${userId}`, { headers }).subscribe({
      next: () => this.loadUsersAndPlants()
    });
  }

  deletePlant(plantId: string): void {
    const headers = this.authService.getAuthHeaders().set('x-admin-code', 'letmein2025');
    this.http.delete(`http://localhost:3000/admin/delete-plant/${plantId}`, { headers }).subscribe({
      next: () => this.loadUsersAndPlants()
    });
  }
}
