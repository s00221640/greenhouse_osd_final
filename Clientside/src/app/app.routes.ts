import { Routes } from '@angular/router';
import { PlantListComponent } from './components/plant-list/plant-list.component';
import { PlantCreateComponent } from './components/plant-create/plant-create.component';
import { PlantEditComponent } from './components/plant-edit/plant-edit.component';
import { AppComponent} from './app.component';
import { LoginComponent } from './components/login.component';
import { AlmanacComponent } from './components/almanac/almanac.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: PlantListComponent },
  { path: 'create', component: PlantCreateComponent },
  { path: 'edit/:id', component: PlantEditComponent },
  { path: '', component: AppComponent },
  { path: 'login', component: LoginComponent },
  { path: 'almanac', component: AlmanacComponent },
  { path: 'admin', component: AdminDashboardComponent },
];

console.log(routes);

