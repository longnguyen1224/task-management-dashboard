export interface Task {
  id: string;

  title: string;
  description?: string;

  category?: string;

  status: 'Todo' | 'InProgress' | 'Review' | 'Done';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
