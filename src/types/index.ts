export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  goalId?: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string;
  status: TaskStatus;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
  aiSuggested?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  aiSummary?: string;
  aiPrompt?: string;
}

export interface GoalWithTasks extends Goal {
  tasks: Task[];
}

export type LanguagePreference = 'system' | 'en' | 'zh';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: LanguagePreference;
  notificationsEnabled: boolean;
  genAiEnabled: boolean;
  syncOnCellular: boolean;
}

export interface GenAiTaskSuggestion {
  title: string;
  description?: string;
  priority: Priority;
  dueInDays?: number;
}

export interface GenAiGoalBreakdownResponse {
  summary: string;
  tasks: GenAiTaskSuggestion[];
}

export interface SyncMetadata {
  syncStatus: 'pending' | 'in_flight' | 'synced' | 'error';
  lastSyncedAt?: string;
  errorMessage?: string;
}
