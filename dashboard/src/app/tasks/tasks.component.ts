import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { TasksService } from './tasks.service';
import { Task } from './task.model';

type TaskStatus = 'Todo' | 'InProgress' | 'Review' | 'Done';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {

  private tasksService = inject(TasksService);
  private cdr = inject(ChangeDetectorRef);

  //STATE
  loading = true;

  tasks: Task[] = [];
  tasksByStatus: Record<TaskStatus, Task[]> = {
    Todo: [],
    InProgress: [],
    Review: [],
    Done: [],
  };

  //CREATE
  title = '';
  description = '';
  category = 'Work';
  creating = false;
  addingInStatus: TaskStatus | null = null;

  //EDIT
  editingId: string | null = null;
  editTitle = '';
  editDescription = '';
  editCategory = 'Work';

  //FILTER / SEARCH
  searchTerm = '';
  activeCategory = 'All';
  activeFilter: 'All' | TaskStatus = 'All';
  activeSort: 'Alphabetical' | 'Status' | null = null;

  //CATEGORIES
  categories = ['Work', 'Personal', 'School'];
  showAddCategory = false;
  newCategory = '';

  //RBAC (UI ONLY)
  userRole: 'OWNER' | 'ADMIN' | 'USER' = 'USER';

  get canEdit(): boolean {
    return this.userRole === 'OWNER' || this.userRole === 'ADMIN';
  }

  //UI 
  userMenuOpen = false;
  openMenuTask: Task | null = null;
  darkMode = false;

  //WORKFLOW
  workflowStatuses: { key: TaskStatus; label: string }[] = [
    { key: 'Todo', label: 'To Do' },
    { key: 'InProgress', label: 'In Progress' },
    { key: 'Review', label: 'Review' },
    { key: 'Done', label: 'Done' },
  ];

  //LIFECYCLE 
  ngOnInit(): void {
    this.loadUserFromToken();
    this.loadTasks();
  }

  //DATA 
  loadTasks(): void {
    this.loading = true;

    this.tasksService.getTasks().subscribe({
      next: tasks => {
        this.tasks = tasks.map(t => ({
          ...t,
          status: t.status ?? 'Todo',
          order: t.order ?? 0,
        }));

        this.rebuildColumns(this.tasks);
        this.applyFiltersAndSort();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loading = false),
    });
  }

  private rebuildColumns(list: Task[]): void {
    this.tasksByStatus = {
      Todo: [],
      InProgress: [],
      Review: [],
      Done: [],
    };

    list.forEach(task => {
      this.tasksByStatus[task.status].push(task);
    });

    (Object.keys(this.tasksByStatus) as TaskStatus[]).forEach(status =>
      this.tasksByStatus[status].sort((a, b) => a.order - b.order)
    );
  }

  loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role ?? 'USER';
    } catch {
      this.userRole = 'USER';
    }
  }

  //CATEGORY
  addCategory(): void {
    const c = this.newCategory.trim();
    if (!c || this.categories.includes(c)) return;

    this.categories.push(c);
    this.newCategory = '';
    this.showAddCategory = false;
  }

  //CREATE
  createTask(): void {
    if (!this.title.trim()) return;

    this.tasksService.createTask({
      title: this.title,
      description: this.description,
      category: this.category,
      status: this.addingInStatus ?? 'Todo',
    }).subscribe(() => {
      this.title = '';
      this.description = '';
      this.category = this.categories[0];
      this.addingInStatus = null;
      this.loadTasks();
    });
  }

  startAddTask(status: TaskStatus): void {
    this.addingInStatus = status;
  }

  //EDIT
  startEdit(task: Task): void {
    this.editingId = task.id;
    this.editTitle = task.title;
    this.editDescription = task.description ?? '';
    this.editCategory = task.category ?? 'Work';
    this.toggleMenu(null);
  }

  saveEdit(task: Task): void {
    this.tasksService.updateTask(task.id, {
      title: this.editTitle,
      description: this.editDescription,
      category: this.editCategory,
    }).subscribe(() => {
      this.editingId = null;
      this.loadTasks();
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  deleteTask(id: string): void {
    if (!confirm('Delete this task?')) return;
    this.tasksService.deleteTask(id).subscribe(() => this.loadTasks());
  }

  //COMPLETE
  markComplete(task: Task): void {
    const oldStatus = task.status;
    const newStatus: TaskStatus =
      task.status === 'Done' ? 'Todo' : 'Done';

    this.tasksByStatus[oldStatus] =
      this.tasksByStatus[oldStatus].filter(t => t.id !== task.id);

    task.status = newStatus;
    this.tasksByStatus[newStatus].unshift(task);

    this.recalculateOrders(oldStatus);
    this.recalculateOrders(newStatus);

    this.tasksService.updateTask(task.id, {
      status: newStatus,
      order: task.order,
    }).subscribe();
  }

  //DRAG & DROP
  dropInColumn(
    event: CdkDragDrop<Task[]>,
    newStatus: TaskStatus
  ): void {

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.persistOrder(event.container.data);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedTask = event.container.data[event.currentIndex];
    movedTask.status = newStatus;

    this.persistOrder(event.container.data);
    this.tasksService.updateTask(movedTask.id, {
      status: newStatus,
      order: movedTask.order,
    }).subscribe();
  }

  private persistOrder(list: Task[]): void {
    list.forEach((task, index) => {
      task.order = index;
      this.tasksService.updateTask(task.id, { order: index }).subscribe();
    });
  }

  private recalculateOrders(status: TaskStatus): void {
    this.tasksByStatus[status].forEach((t, i) => (t.order = i));
  }

  //FILTER SORT
  applyFiltersAndSort(): void {
    let list = [...this.tasks];

    if (this.activeCategory !== 'All') {
      list = list.filter(t => t.category === this.activeCategory);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
      );
    }

    if (this.activeFilter !== 'All') {
      list = list.filter(t => t.status === this.activeFilter);
    }

    this.rebuildColumns(list);

    if (this.activeSort === 'Alphabetical') {
      (Object.keys(this.tasksByStatus) as TaskStatus[]).forEach(status =>
        this.tasksByStatus[status].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
    }
  }

  setCategory(cat: string): void {
    this.activeCategory = cat;
    this.applyFiltersAndSort();
  }

  setFilter(filter: 'All' | TaskStatus): void {
    this.activeFilter = filter;
    this.applyFiltersAndSort();
  }

  setSort(sort: 'Alphabetical' | 'Status'): void {
    this.activeSort = sort;
    this.applyFiltersAndSort();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  //UI HELPERS
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark', this.darkMode);
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  toggleMenu(task: Task | null): void {
    this.openMenuTask = this.openMenuTask === task ? null : task;
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    if (this.activeFilter !== 'All' && this.activeFilter !== status) {
      return [];
    }
    return this.tasksByStatus[status];
  }

  trackById(_: number, task: Task): string {
    return task.id;
  }
}
