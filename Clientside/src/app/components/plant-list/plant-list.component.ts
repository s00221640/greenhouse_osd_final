import { Component, OnInit } from '@angular/core';
import { PlantService, Plant } from '../../services/plant.service';
import { AuthService } from '../tempAuthService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlantImageGalleryComponent } from '../plant-image-gallery/plant-image-gallery.component';

// NEW: visual helpers
import { seasonFromDate, wateringStatus } from '../../utils/season.util';

@Component({
  selector: 'app-plant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PlantImageGalleryComponent],
  templateUrl: './plant-list.component.html',
  styleUrls: ['./plant-list.component.css'],
})
export class PlantListComponent implements OnInit {
  plants: Plant[] = [];
  selectedPlant: Plant | null = null;

  newPlant: Partial<Plant> = {
    name: '',
    species: '',
    plantingDate: '',
    wateringFrequency: 1,
    lightRequirement: 'Full Sun',
  };

  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  showImageGallery = false;
  selectedGalleryImageUrl: string | null = null;

  constructor(
    private plantService: PlantService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlants();
  }

  loadPlants(): void {
    this.plantService.getAllPlants().subscribe({
      next: (data) => {
        this.plants = data;
        console.log('Loaded plants:', this.plants);
      },
      error: (err) => console.error('Error fetching plants:', err),
    });
  }

  // ---------- Visual helpers for template ----------
  seasonOf(p: Plant): string {
    return seasonFromDate(p.plantingDate || '');
  }

  waterChip(p: Plant): { label: string; severity: 'ok' | 'soon' | 'due' | 'info' } {
    return wateringStatus(p.plantingDate || '', p.wateringFrequency);
  }

  rowSeverityClass(p: Plant): string {
    const s = this.waterChip(p).severity;
    if (s === 'due') return 'row-due';
    if (s === 'soon') return 'row-soon';
    return '';
  }
  // -------------------------------------------------

  onFileChange(event: any): void {
    this.imageFile = event.target.files[0];
    this.selectedGalleryImageUrl = null;

    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => (this.imagePreviewUrl = reader.result as string);
      reader.readAsDataURL(this.imageFile);
    } else {
      this.imagePreviewUrl = null;
    }
  }

  toggleImageGallery(): void {
    this.showImageGallery = !this.showImageGallery;
  }

  onGalleryImageSelected(imageUrl: string): void {
    this.selectedGalleryImageUrl = imageUrl;
    this.imagePreviewUrl = imageUrl;
    this.imageFile = null;
    this.showImageGallery = false;
  }

  closeImageGallery(): void {
    this.showImageGallery = false;
  }

  async fetchImageAsFile(url: string): Promise<File | null> {
    try {
      const fullUrl = window.location.origin + '/' + url;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'plant-image.png';
      return new File([blob], fileName, { type: 'image/png' });
    } catch (error) {
      console.error('Error fetching image as file:', error);
      return null;
    }
  }

  async onSubmit(): Promise<void> {
    const formData = new FormData();
    formData.append('name', this.newPlant.name || '');
    formData.append('species', this.newPlant.species || '');
    formData.append('plantingDate', this.newPlant.plantingDate || '');
    formData.append('wateringFrequency', String(this.newPlant.wateringFrequency ?? 1));
    formData.append('lightRequirement', this.newPlant.lightRequirement || 'Full Sun');

    const user = this.authService.getUser();
    if (user?.email) formData.append('userEmail', user.email);

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    } else if (this.selectedGalleryImageUrl) {
      const imageFile = await this.fetchImageAsFile(this.selectedGalleryImageUrl);
      if (imageFile) formData.append('image', imageFile);
    }

    this.plantService.createPlant(formData).subscribe({
      next: () => {
        this.loadPlants();
        this.resetForm();
      },
      error: (err) => console.error('Error creating plant:', err),
    });
  }

  editPlant(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  deletePlant(id: string): void {
    this.plantService.deletePlant(id).subscribe({
      next: () => this.loadPlants(),
      error: (err) => console.error('Error deleting plant:', err),
    });
  }

  selectPlant(plant: Plant): void {
    this.selectedPlant = plant;
  }

  resetForm(): void {
    this.newPlant = {
      name: '',
      species: '',
      plantingDate: '',
      wateringFrequency: 1,
      lightRequirement: 'Full Sun',
    };
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.selectedGalleryImageUrl = null;
    this.showImageGallery = false;
  }
}
