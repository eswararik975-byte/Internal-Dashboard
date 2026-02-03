import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { ProjectsComponent } from './pages/projects.component';
import { WorkLogsComponent } from './pages/work-logs.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'work-logs', component: WorkLogsComponent }
];
