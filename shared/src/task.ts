export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  aiPriorityScore?: number; // 0-100
  dueDate?: Date;
  category: TaskCategory;
  status: TaskStatus;
  linkedEvents?: string[]; // Calendar event IDs
  createdBy: 'user' | 'ai-suggestion';
  subtasks?: Subtask[];
  attachments?: TaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'personal' | 'family';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}