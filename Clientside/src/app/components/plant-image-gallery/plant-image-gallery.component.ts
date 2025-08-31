import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plant-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-gallery-container">
      <h3>Choose from gallery</h3>
      <div class="image-grid">
        <div 
          *ngFor="let image of plantImages" 
          class="image-item" 
          [class.selected]="selectedImage === image.url"
          (click)="selectImage(image.url)"
        >
          <img [src]="image.url" [alt]="image.name" class="gallery-image">
          <div class="image-name">{{ image.name }}</div>
        </div>
      </div>
      <div class="gallery-actions">
        <button 
          (click)="confirmSelection()" 
          class="select-btn" 
          [disabled]="!selectedImage"
        >
          Use Selected Image
        </button>
        <button (click)="closeGallery()" class="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .image-gallery-container {
      background-color: #f4fbf6;
      border: 1px solid #c8e6c9;
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
    }
    
    h3 {
      color: #2e8b57;
      margin-top: 0;
      text-align: center;
    }
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .image-item {
      border: 2px solid transparent;
      padding: 5px;
      border-radius: 5px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    
    .image-item:hover {
      border-color: #95d5b2;
      background-color: #e8f5e9;
    }
    
    .image-item.selected {
      border-color: #2e8b57;
      background-color: #e8f5e9;
    }
    
    .gallery-image {
      width: 100%;
      height: 100px;
      object-fit: contain;
      margin-bottom: 5px;
    }
    
    .image-name {
      font-size: 0.9rem;
      color: #444;
    }
    
    .gallery-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    
    .select-btn, .cancel-btn {
      padding: 8px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .select-btn {
      background-color: #388e3c;
      color: white;
    }
    
    .select-btn:disabled {
      background-color: #95d5b2;
      cursor: not-allowed;
    }
    
    .cancel-btn {
      background-color: #f0f0f0;
      color: #444;
    }

    @media (max-width: 768px) {
      .image-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class PlantImageGalleryComponent {
  @Output() imageSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  
  selectedImage: string | null = null;
  
  // Using placehold.co which is more reliable
  plantImages = [
    { name: 'Basil', url: 'assets/plant-images/basil.png' },
    { name: 'Mint', url: 'assets/plant-images/mint.png' },
    { name: 'Rosemary', url: 'assets/plant-images/rosemary.png' },
    { name: 'Tomato Plant', url: 'assets/plant-images/tomato.png' },
    { name: 'Bell Pepper', url: 'assets/plant-images/bell-pepper.png' },
    { name: 'Apple Tree', url: 'assets/plant-images/apple-tree.png' },
    { name: 'Strawberry', url: 'assets/plant-images/strawberry.png' },
    { name: 'Carrot', url: 'assets/plant-images/carrot.png' },
    { name: 'Potato', url: 'assets/plant-images/potato.png' },
    { name: 'Sunflower', url: 'assets/plant-images/sunflower.png' },
    { name: 'Rose', url: 'assets/plant-images/rose.png' },
    { name: 'Tulip', url: 'assets/plant-images/tulip.png' }
  ];
  
  selectImage(url: string): void {
    this.selectedImage = url;
  }
  
  confirmSelection(): void {
    if (this.selectedImage) {
      this.imageSelected.emit(this.selectedImage);
    }
  }
  
  closeGallery(): void {
    this.close.emit();
  }
}