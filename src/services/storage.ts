import AsyncStorage from '@react-native-async-storage/async-storage';

import { GoalWithTasks, Task, UserPreferences } from '@/types';

const STORAGE_KEY = 'taskmind_state_v1';

export interface TaskMindSnapshot {
  goals: GoalWithTasks[];
  inboxTasks: Task[];
  preferences: UserPreferences;
}

export async function loadSnapshot(): Promise<TaskMindSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as TaskMindSnapshot;
  } catch (error) {
    console.warn('Failed to load snapshot', error);
    return null;
  }
}

export async function saveSnapshot(snapshot: TaskMindSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to persist snapshot', error);
  }
}

export async function clearSnapshot(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear snapshot', error);
  }
}
