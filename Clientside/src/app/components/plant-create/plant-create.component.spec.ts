import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantCreateComponent } from './plant-create.component';

describe('PlantCreateComponent', () => {
  let component: PlantCreateComponent;
  let fixture: ComponentFixture<PlantCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
