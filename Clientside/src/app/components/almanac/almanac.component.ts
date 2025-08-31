import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PlantService, Plant } from '../../services/plant.service';
import { FormsModule } from '@angular/forms';

interface WateringEvent {
  plantId: string;
  plantName: string;
  date: Date;
}

@Component({
  selector: 'app-almanac',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './almanac.component.html',
  styleUrls: ['./almanac.component.css']
})
export class AlmanacComponent implements OnInit {
  plants: Plant[] = [];
  
  // Dashboard statistics
  totalPlants: number = 0;
  plantsByWatering: { [key: string]: number } = {
    'Nearly Never': 0,
    'Weekly': 0,
    'Daily': 0
  };
  plantsByLight: { [key: string]: number } = {
    'Full Sun': 0,
    'Partial Shade': 0,
    'Low Light': 0
  };
  
  // Watering data
  plantsDueForWatering: Plant[] = [];
  wateringHistory: WateringEvent[] = [];
  
  // Seasonal data
  currentSeason: string = '';
  seasonalTips: string = '';
  
  // Calendar view - simplistic implementation
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private plantService: PlantService) {}

  ngOnInit(): void {
    this.loadPlants();
    this.generateCalendar();
    this.determineCurrentSeason();
    
    // Try to load watering history from localStorage
    const savedHistory = localStorage.getItem('wateringHistory');
    if (savedHistory) {
      this.wateringHistory = JSON.parse(savedHistory);
      // Convert string dates back to Date objects
      this.wateringHistory.forEach(event => {
        event.date = new Date(event.date);
      });
    }
  }

  loadPlants(): void {
    this.plantService.getAllPlants().subscribe({
      next: (data) => {
        this.plants = data;
        this.calculateStatistics();
        this.identifyPlantsDueForWatering();
      },
      error: (err) => {
        console.error('Error fetching plants for almanac:', err);
      }
    });
  }

  calculateStatistics(): void {
    this.totalPlants = this.plants.length;
    
    // Reset counters
    this.plantsByWatering = {
      'Nearly Never': 0,
      'Weekly': 0,
      'Daily': 0
    };
    
    this.plantsByLight = {
      'Full Sun': 0,
      'Partial Shade': 0,
      'Low Light': 0
    };
    
    // Count plants by category
    this.plants.forEach(plant => {
      // Watering frequency
      if (plant.wateringFrequency === 1) {
        this.plantsByWatering['Nearly Never']++;
      } else if (plant.wateringFrequency === 2) {
        this.plantsByWatering['Weekly']++;
      } else if (plant.wateringFrequency === 3) {
        this.plantsByWatering['Daily']++;
      }
      
      // Light requirements
      if (plant.lightRequirement) {
        if (this.plantsByLight[plant.lightRequirement] !== undefined) {
          this.plantsByLight[plant.lightRequirement]++;
        } else {
          // Handle any other light requirement values
          this.plantsByLight[plant.lightRequirement] = 1;
        }
      }
    });
  }

  identifyPlantsDueForWatering(): void {
    const today = new Date();
    this.plantsDueForWatering = [];
    
    this.plants.forEach(plant => {
      // Get the last watering date for this plant, if any
      const lastWatering = this.getLastWateringDate(plant._id!);
      
      if (!lastWatering) {
        // If never watered, it's due
        this.plantsDueForWatering.push(plant);
        return;
      }
      
      const daysSinceWatering = this.getDaysBetweenDates(lastWatering, today);
      
      // Determine if due based on watering frequency
      if (plant.wateringFrequency === 1 && daysSinceWatering >= 21) { // 3 weeks for "Nearly Never" plants
        this.plantsDueForWatering.push(plant);
      } else if (plant.wateringFrequency === 2 && daysSinceWatering >= 7) { // 7 days for "Weekly" plants
        this.plantsDueForWatering.push(plant);
      } else if (plant.wateringFrequency === 3 && daysSinceWatering >= 1) { // 1 day for "Daily" plants
        this.plantsDueForWatering.push(plant);
      }
    });
  }

  getLastWateringDate(plantId: string): Date | null {
    // Find the most recent watering event for this plant
    const plantWaterings = this.wateringHistory
      .filter(event => event.plantId === plantId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return plantWaterings.length > 0 ? plantWaterings[0].date : null;
  }

  getDaysBetweenDates(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  recordWatering(plant: Plant): void {
    const wateringEvent: WateringEvent = {
      plantId: plant._id!,
      plantName: plant.name,
      date: new Date()
    };
    
    this.wateringHistory.push(wateringEvent);
    localStorage.setItem('wateringHistory', JSON.stringify(this.wateringHistory));
    this.identifyPlantsDueForWatering();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      this.calendarDays.push({ day: null, plants: [] });
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, i);
      const plantsForDay = this.getPlantsForDate(currentDate);
      this.calendarDays.push({ day: i, plants: plantsForDay });
    }
  }

  getPlantsForDate(date: Date): Plant[] {
    // This is a simplified logic - in reality, you'd need more complex rules
    // to determine which plants need watering on which dates
    const result: Plant[] = [];
    
    this.plants.forEach(plant => {
      // "Nearly Never" (1) plants on the 1st of the month
      if (plant.wateringFrequency === 1 && date.getDate() === 1) {
        result.push(plant);
      }
      // "Weekly" (2) plants on every Sunday
      else if (plant.wateringFrequency === 2 && date.getDay() === 0) {
        result.push(plant);
      }
      // "Daily" (3) plants every day
      else if (plant.wateringFrequency === 3) {
        result.push(plant);
      }
    });
    
    return result;
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  determineCurrentSeason(): void {
    const today = new Date();
    const month = today.getMonth();
    
    // Northern hemisphere seasons (adjust if needed for southern hemisphere)
    if (month >= 2 && month <= 4) {
      this.currentSeason = 'Spring';
      this.seasonalTips = 'Spring is growing season! Increase watering frequency and consider repotting plants that have outgrown their containers.';
    } else if (month >= 5 && month <= 7) {
      this.currentSeason = 'Summer';
      this.seasonalTips = 'Summer heat can stress plants. Keep an eye on your Full Sun plants for signs of scorching, and consider more frequent watering.';
    } else if (month >= 8 && month <= 10) {
      this.currentSeason = 'Fall';
      this.seasonalTips = 'As daylight decreases, reduce watering frequency. Prepare to move outdoor plants inside before first frost.';
    } else {
      this.currentSeason = 'Winter';
      this.seasonalTips = 'Plants need less water in winter. Move plants closer to windows to maximize light exposure during shorter days.';
    }
  }

  getWateringFrequencyText(frequency: number): string {
    switch (frequency) {
      case 1: return 'Nearly Never';
      case 2: return 'Weekly';
      case 3: return 'Daily';
      default: return 'Unknown';
    }
  }
}