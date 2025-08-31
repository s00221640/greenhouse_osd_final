import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plant-create',
  template: '',
  styleUrls: ['./plant-create.component.css']
})
export class PlantCreateComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/']); // Automatically redirect to the main page
  }
}
