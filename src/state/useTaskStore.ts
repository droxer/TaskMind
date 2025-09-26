import { useEffect } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { saveSnapshot, loadSnapshot, TaskMindSnapshot } from '@/services/storage';
import { pushSnapshot } from '@/services/syncService';
import { Goal, GoalWithTasks, Priority, SyncMetadata, Task, TaskStatus, UserPreferences } from '@/types';
import { createId } from '@/utils/id';

interface CreateGoalInput {
  title: string;
  description?: string;
  targetDate?: string;
  aiSummary?: string;
  aiPrompt?: string;
  tasks?: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;
}

interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: Priority;
  dueDate?: string;
  goalId?: string;
  aiSuggested?: boolean;
}

interface UpdateGoalInput extends Partial<Omit<Goal, 'id'>> {}
interface UpdateTaskInput extends Partial<Omit<Task, 'id' | 'goalId'>> {}

interface TaskMindState {
  goals: GoalWithTasks[];
  inboxTasks: Task[];
  preferences: UserPreferences;
  syncMetadata: SyncMetadata;
  hydrate: () => Promise<void>;
  createGoal: (input: CreateGoalInput) => GoalWithTasks;
  updateGoal: (id: string, updates: UpdateGoalInput) => void;
  deleteGoal: (id: string) => void;
  attachTasksToGoal: (goalId: string, tasks: Task[]) => void;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, updates: UpdateTaskInput) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
  setPreferences: (updates: Partial<UserPreferences>) => void;
  markSynced: (timestamp: string) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notificationsEnabled: true,
  genAiEnabled: true,
  syncOnCellular: false
};

const defaultSyncMetadata: SyncMetadata = {
  syncStatus: 'pending'
};

export const useTaskStore = create<TaskMindState>()(
  immer((set, get) => ({
    goals: [],
    inboxTasks: [],
    preferences: defaultPreferences,
    syncMetadata: defaultSyncMetadata,

    hydrate: async () => {
      const snapshot = await loadSnapshot();
      if (!snapshot) {
        return;
      }
      set((state) => {
        state.goals = snapshot.goals;
        state.inboxTasks = snapshot.inboxTasks;
        state.preferences = snapshot.preferences;
        state.syncMetadata = { ...defaultSyncMetadata, syncStatus: 'pending' };
      });
    },

    createGoal: (input) => {
      const now = new Date().toISOString();
      const goalId = createId();
      const goal: GoalWithTasks = {
        id: goalId,
        title: input.title,
        description: input.description,
        targetDate: input.targetDate,
        status: 'not_started',
        createdAt: now,
        updatedAt: now,
        aiSummary: input.aiSummary,
        aiPrompt: input.aiPrompt,
        tasks: []
      };

      set((state) => {
        state.goals.unshift(goal);
        state.syncMetadata.syncStatus = 'pending';
      });

      if (input.tasks?.length) {
        const tasksToAttach = input.tasks.map((task) => ({
          ...task,
          id: createId(),
          goalId,
          status: task.status ?? 'todo',
          priority: task.priority ?? 'medium',
          createdAt: now,
          updatedAt: now
        }));
        get().attachTasksToGoal(goalId, tasksToAttach);
      }

      persistSnapshot();
      return goal;
    },

    updateGoal: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        const goal = state.goals.find((item) => item.id === id);
        if (!goal) {
          return;
        }
        Object.assign(goal, updates, { updatedAt: now });
        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    deleteGoal: (id) => {
      set((state) => {
        state.goals = state.goals.filter((goal) => goal.id !== id);
        state.inboxTasks.forEach((task) => {
          if (task.goalId === id) {
            task.goalId = undefined;
          }
        });
        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    attachTasksToGoal: (goalId, tasks) => {
      set((state) => {
        const goal = state.goals.find((item) => item.id === goalId);
        if (!goal) {
          return;
        }
        goal.tasks = [...goal.tasks, ...tasks];
        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    createTask: (input) => {
      const now = new Date().toISOString();

      const task: Task = {
        id: createId(),
        title: input.title,
        notes: input.notes,
        priority: input.priority ?? 'medium',
        dueDate: input.dueDate,
        status: 'todo',
        reminderAt: undefined,
        createdAt: now,
        updatedAt: now,
        goalId: input.goalId,
        aiSuggested: input.aiSuggested ?? false
      };

      set((state) => {
        if (input.goalId) {
          const goal = state.goals.find((item) => item.id === input.goalId);
          if (goal) {
            goal.tasks.unshift(task);
            goal.updatedAt = now;
          } else {
            state.inboxTasks.unshift(task);
          }
        } else {
          state.inboxTasks.unshift(task);
        }
        state.syncMetadata.syncStatus = 'pending';
      });

      persistSnapshot();
      return task;
    },

    updateTask: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        const updateWithin = (collection: Task[]) => {
          const task = collection.find((item) => item.id === id);
          if (task) {
            Object.assign(task, updates, { updatedAt: now });
            return true;
          }
          return false;
        };

        const goal = state.goals.find((g) => g.tasks.some((task) => task.id === id));
        if (goal && updateWithin(goal.tasks)) {
          goal.updatedAt = now;
        } else if (!updateWithin(state.inboxTasks)) {
          // Task not found – nothing to update.
          return;
        }

        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    toggleTaskStatus: (id) => {
      set((state) => {
        const toggleInCollection = (collection: Task[]) => {
          const task = collection.find((item) => item.id === id);
          if (!task) {
            return false;
          }
          const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
          task.status = nextStatus;
          task.updatedAt = new Date().toISOString();
          return true;
        };

        const goal = state.goals.find((g) => g.tasks.some((task) => task.id === id));
        if (goal && toggleInCollection(goal.tasks)) {
          goal.updatedAt = new Date().toISOString();
        } else if (!toggleInCollection(state.inboxTasks)) {
          return;
        }

        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    deleteTask: (id) => {
      set((state) => {
        state.inboxTasks = state.inboxTasks.filter((task) => task.id !== id);
        state.goals = state.goals.map((goal) => ({
          ...goal,
          tasks: goal.tasks.filter((task) => task.id !== id)
        }));
        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    setPreferences: (updates) => {
      set((state) => {
        state.preferences = { ...state.preferences, ...updates };
        state.syncMetadata.syncStatus = 'pending';
      });
      persistSnapshot();
    },

    markSynced: (timestamp) => {
      set((state) => {
        state.syncMetadata = {
          syncStatus: 'synced',
          lastSyncedAt: timestamp
        };
      });
    }
  }))
);

async function persistSnapshot() {
  const state = useTaskStore.getState();
  const snapshot: TaskMindSnapshot = {
    goals: state.goals,
    inboxTasks: state.inboxTasks,
    preferences: state.preferences
  };
  await saveSnapshot(snapshot);
  const result = await pushSnapshot({
    goals: state.goals,
    inboxTasks: state.inboxTasks,
    lastUpdatedAt: new Date().toISOString()
  });
  if (result.status === 'success') {
    useTaskStore.getState().markSynced(result.timestamp);
  } else if (result.status === 'error') {
    useTaskStore.setState((draft) => {
      draft.syncMetadata = {
        syncStatus: 'error',
        errorMessage: result.error.message
      };
    });
  }
}

export function useGoals() {
  return useTaskStore((state) => state.goals);
}

export function useInboxTasks() {
  return useTaskStore((state) => state.inboxTasks);
}

export function usePreferences() {
  return useTaskStore((state) => state.preferences);
}

export function useSyncMetadata() {
  return useTaskStore((state) => state.syncMetadata);
}

export function useHydratedStore() {
  const hydrate = useTaskStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}
