import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Plant {
  _id?: string;
  name: string;
  species: string;
  plantingDate: string;
  wateringFrequency?: number;
  lightRequirement?: string;
  imageUrl?: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class PlantService {
  // '' -> same origin in production (Railway), http://localhost:3000 in dev
  private readonly API = environment.apiBase || '';
  private readonly base = `${this.API}/plants`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllPlants(): Observable<Plant[]> {
    return this.http
      .get<Plant[]>(this.base, { headers: this.getAuthHeaders() })
      .pipe(
        tap(data => console.log('Fetched all plants:', data)),
        catchError(err => {
          console.error('Error fetching all plants:', err);
          return throwError(() => err);
        })
      );
  }

  getPlantById(id: string): Observable<Plant> {
    return this.http
      .get<Plant>(`${this.base}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(data => console.log('Received plant data:', data)),
        catchError(err => {
          console.error('Error fetching plant by ID:', err);
          return throwError(() => err);
        })
      );
  }

  createPlant(plantData: Plant | FormData): Observable<Plant> {
    // Do not set Content-Type for FormData; browser will handle boundary
    const headers = this.getAuthHeaders();
    return this.http
      .post<Plant>(this.base, plantData, { headers })
      .pipe(
        tap(data => console.log('Plant created:', data)),
        catchError(err => {
          console.error('Error creating plant:', err);
          return throwError(() => err);
        })
      );
  }

  updatePlant(id: string, plant: Plant | FormData): Observable<Plant> {
    const headers = this.getAuthHeaders();
    return this.http
      .put<Plant>(`${this.base}/${id}`, plant, { headers })
      .pipe(
        tap(() => console.log('Plant updated successfully')),
        catchError(err => {
          console.error('Error updating plant:', err);
          return throwError(() => err);
        })
      );
  }

  deletePlant(id: string): Observable<any> {
    return this.http
      .delete(`${this.base}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => console.log('Plant deleted successfully')),
        catchError(err => {
          console.error('Error deleting plant:', err);
          return throwError(() => err);
        })
      );
  }
}
