import { Routes } from '@angular/router';
import { LoginPage } from './auth/login.page';
import { TasksComponent } from './tasks/tasks.component';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'tasks', component: TasksComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
