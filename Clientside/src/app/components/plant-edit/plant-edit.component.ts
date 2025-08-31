import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Plant, PlantService } from '../../services/plant.service';
import { PlantImageGalleryComponent } from '../plant-image-gallery/plant-image-gallery.component';

@Component({
  selector: 'app-plant-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, PlantImageGalleryComponent],
  template: `
    <div class="edit-container">
      <h2>Edit Plant</h2>
      <div *ngIf="loading" class="loading">Loading plant data...</div>
      <div *ngIf="errorMessage" class="error text-danger">{{ errorMessage }}</div>

      <form *ngIf="!loading && plant" (ngSubmit)="onSubmit()" class="edit-form">
        <div class="form-group">
          <label for="name">Plant Name:</label>
          <input [(ngModel)]="plant.name" name="name" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="species">Species:</label>
          <input [(ngModel)]="plant.species" name="species" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="plantingDate">Planting Date:</label>
          <input [(ngModel)]="plant.plantingDate" name="plantingDate" type="date" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="wateringFrequency">Watering Frequency:</label>
          <select [(ngModel)]="plant.wateringFrequency" name="wateringFrequency" class="form-control" required>
            <option value="1">1 (Low – Nearly Never)</option>
            <option value="2">2 (Weekly)</option>
            <option value="3">3 (Often)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="lightRequirement">Light Requirement:</label>
          <select [(ngModel)]="plant.lightRequirement" name="lightRequirement" class="form-control" required>
            <option>Full Sun</option>
            <option>Partial Shade</option>
            <option>Shade</option>
          </select>
        </div>

        <!-- Image Section -->
        <div class="form-group">
          <label>Plant Image:</label>
          
          <div class="current-image" *ngIf="plant.imageUrl">
            <p>Current Image:</p>
            <img [src]="plant.imageUrl" alt="Current plant image" class="thumbnail-image">
          </div>
          
          <div class="image-selection-container">
            <div class="image-options">
              <div class="option">
                <label>Upload new image:</label>
                <input
                  type="file"
                  (change)="onFileChange($event)"
                  accept="image/*"
                  class="form-control"
                />
              </div>
              
              <div class="option-divider">OR</div>
              
              <div class="option">
                <button 
                  type="button" 
                  (click)="toggleImageGallery()" 
                  class="gallery-btn"
                >
                  Choose from Gallery
                </button>
              </div>
            </div>
            
            <div *ngIf="showImageGallery">
              <app-plant-image-gallery
                (imageSelected)="onGalleryImageSelected($event)"
                (close)="closeImageGallery()"
              ></app-plant-image-gallery>
            </div>
            
            <div *ngIf="imagePreviewUrl" class="preview-container">
              <p>New Image Preview:</p>
              <img [src]="imagePreviewUrl" alt="New image preview" class="thumbnail-image">
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
    </div>
  `,
  styles: [`
    .edit-container {
      max-width: 500px;
      margin: 20px auto;
      background-color: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #c8e6c9;
    }
    h2 {
      text-align: center;
      color: #388e3c;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-control {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
      border-radius: 4px;
      border: 1px solid #c8e6c9;
    }
    .btn-primary {
      background-color: #388e3c;
      color: white;
      border: none;
      width: 100%;
      padding: 10px;
    }
    .btn-primary:hover {
      background-color: #2e7d32;
    }
    .error {
      margin-bottom: 15px;
      color: #d32f2f;
      text-align: center;
    }
    
    /* Image styling */
    .current-image {
      margin-bottom: 15px;
      padding: 10px;
      border: 1px dashed #c8e6c9;
      border-radius: 5px;
      background-color: rgba(200, 230, 201, 0.2);
    }
    
    .current-image p, .preview-container p {
      font-weight: bold;
      color: #388e3c;
      margin-bottom: 5px;
    }
    
    .thumbnail-image {
      max-width: 100%;
      max-height: 150px;
      display: block;
      margin: 0 auto;
    }
    
    .image-selection-container {
      border: 1px solid #c8e6c9;
      border-radius: 5px;
      padding: 15px;
      background-color: #f4fbf6;
    }
    
    .image-options {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .option {
      flex: 1;
    }
    
    .option-divider {
      font-weight: bold;
      color: #388e3c;
    }
    
    .gallery-btn {
      background-color: transparent;
      color: #388e3c;
      border: 1px solid #388e3c;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .gallery-btn:hover {
      background-color: #388e3c;
      color: white;
    }
    
    .preview-container {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #c8e6c9;
    }
  `]
})
export class PlantEditComponent implements OnInit {
  plant: Plant = { name: '', species: '', plantingDate: '', wateringFrequency: 1, lightRequirement: 'Full Sun' };
  loading: boolean = true;
  errorMessage: string | null = null;
  
  // Image handling
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  showImageGallery: boolean = false;
  selectedGalleryImageUrl: string | null = null;

  private plantService: PlantService;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private injector: Injector
  ) {
    this.plantService = this.injector.get(PlantService);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchPlantData(id);
    } else {
      this.errorMessage = 'Invalid plant ID! Redirecting to plant list...';
      this.loading = false;
      setTimeout(() => this.router.navigate(['/']), 3000);
    }
  }

  fetchPlantData(id: string): void {
    this.plantService.getPlantById(id).subscribe({
      next: (data) => {
        this.plant = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load plant data. Redirecting to plant list...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
      },
    });
  }

  onFileChange(event: any): void {
    this.imageFile = event.target.files[0];
    this.selectedGalleryImageUrl = null; // Clear gallery selection when uploading a file

    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
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
    this.imageFile = null; // Clear file upload when gallery image is selected
    this.showImageGallery = false;
  }

  closeImageGallery(): void {
    this.showImageGallery = false;
  }
  
  async fetchImageAsFile(url: string): Promise<File | null> {
    try {
      // For local assets, we need to use the full URL with origin
      const fullUrl = window.location.origin + '/' + url;
      console.log('Fetching image from:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Extract the filename from the URL path
      const fileName = url.split('/').pop() || 'plant-image.png';
      
      return new File([blob], fileName, { type: 'image/png' });
    } catch (error) {
      console.error('Error fetching image as file:', error);
      return null;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.plant._id) {
      // Create form data if we're uploading a new image
      if (this.imageFile || this.selectedGalleryImageUrl) {
        const formData = new FormData();
        formData.append('name', this.plant.name);
        formData.append('species', this.plant.species);
        formData.append('plantingDate', this.plant.plantingDate);
        formData.append('wateringFrequency', String(this.plant.wateringFrequency || 1));
        formData.append('lightRequirement', this.plant.lightRequirement || 'Full Sun');
        
        if (this.imageFile) {
          formData.append('image', this.imageFile);
        } else if (this.selectedGalleryImageUrl) {
          const imageFile = await this.fetchImageAsFile(this.selectedGalleryImageUrl);
          if (imageFile) {
            formData.append('image', imageFile);
          }
        }

        this.plantService.updatePlant(this.plant._id, formData).subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            console.error('Error updating plant:', err);
            this.errorMessage = 'Failed to update plant.';
          }
        });
      } else {
        // Regular update without image changes
        this.plantService.updatePlant(this.plant._id, this.plant).subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            console.error('Error updating plant:', err);
            this.errorMessage = 'Failed to update plant.';
          }
        });
      }
    }
  }
}