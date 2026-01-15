import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000/api';

  getTasks() {
    return this.http.get<Task[]>(`${this.API}/tasks`);
  }

  createTask(data: Partial<Task>) {
    return this.http.post<Task>(`${this.API}/tasks`, data);
  }

  updateTask(id: string, data: Partial<Task>) {
    return this.http.put<Task>(`${this.API}/tasks/${id}`, data);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.API}/tasks/${id}`);
  }
}
