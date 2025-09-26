import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { Priority } from '@/types';
import { requestGoalBreakdown } from '@/services/genAiService';
import { usePreferences, useTaskStore } from '@/state/useTaskStore';
import { formatDate } from '@/utils/date';

interface TaskDraft {
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string;
  aiSuggested: boolean;
}

export default function GoalWizardScreen() {
  const router = useRouter();
  const createGoal = useTaskStore((state) => state.createGoal);
  const preferences = usePreferences();

  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetDate, setTargetDate] = useState<string | undefined>();
  const [context, setContext] = useState('');
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>([]);
  const [summary, setSummary] = useState('');
  const [activeTaskPicker, setActiveTaskPicker] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: requestGoalBreakdown,
    onSuccess: (response) => {
      setSummary(response.summary);
      const baseDate = targetDate ? new Date(targetDate) : new Date();
      const generatedTasks: TaskDraft[] = response.tasks.map((task) => {
        const dueDate = new Date(baseDate);
        if (typeof task.dueInDays === 'number') {
          const offset = Math.max(0, task.dueInDays);
          dueDate.setDate(new Date().getDate() + offset);
        }
        return {
          title: task.title,
          notes: task.description,
          priority: task.priority,
          dueDate: dueDate.toISOString(),
          aiSuggested: true
        };
      });
      setTaskDrafts(generatedTasks);
    }
  });

  const isGenerateDisabled = !goalTitle.trim() || !preferences.genAiEnabled;

  const handleGenerate = async () => {
    if (!preferences.genAiEnabled) {
      Alert.alert('GenAI disabled', 'Enable GenAI in settings to auto-generate task plans.');
      return;
    }
    if (!goalTitle.trim()) {
      Alert.alert('Add goal title', 'Describe the goal to generate a plan.');
      return;
    }
    await mutation.mutateAsync({ goal: goalTitle, targetDate, context });
  };

  const handleTargetChange = (_: DateTimePickerEvent, picked?: Date) => {
    setShowTargetPicker(Platform.OS === 'ios');
    if (picked) {
      setTargetDate(picked.toISOString());
    }
  };

  const handleTaskDateChange = (index: number) => (_: DateTimePickerEvent, picked?: Date) => {
    setActiveTaskPicker(Platform.OS === 'ios' ? index : null);
    if (picked) {
      setTaskDrafts((current) =>
        current.map((task, idx) => (idx === index ? { ...task, dueDate: picked.toISOString() } : task))
      );
    }
  };

  const handleUpdateTask = (index: number, updates: Partial<TaskDraft>) => {
    setTaskDrafts((current) => current.map((task, idx) => (idx === index ? { ...task, ...updates } : task)));
  };

  const handleAddManualTask = () => {
    setTaskDrafts((current) => [
      ...current,
      {
        title: 'New task',
        notes: '',
        priority: 'medium',
        dueDate: targetDate,
        aiSuggested: false
      }
    ]);
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim()) {
      Alert.alert('Missing title', 'Please add a goal title.');
      return;
    }

    const trimmedTasks = taskDrafts.filter((task) => task.title.trim().length > 0);
    if (trimmedTasks.length === 0) {
      Alert.alert('No tasks yet', 'Add or keep at least one task before saving the plan.');
      return;
    }

    createGoal({
      title: goalTitle.trim(),
      description: goalDescription.trim() || undefined,
      targetDate,
      aiSummary: summary,
      aiPrompt: context.trim() || undefined,
      tasks: trimmedTasks.map((task) => ({
        title: task.title.trim(),
        notes: task.notes?.trim(),
        priority: task.priority,
        dueDate: task.dueDate,
        status: 'todo',
        aiSuggested: task.aiSuggested
      }))
    });

    router.back();
  };

  const manualOnly = useMemo(() => !preferences.genAiEnabled, [preferences.genAiEnabled]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Goal wizard</Text>
      <Text style={styles.subtitle}>
        {manualOnly
          ? 'GenAI is disabled. Re-enable in settings or continue with manual planning.'
          : 'Describe your goal and receive a breakdown you can tweak before saving.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Goal</Text>
        <TextInput
          style={styles.input}
          placeholder="Launch a new marketing campaign"
          value={goalTitle}
          onChangeText={setGoalTitle}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Details</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="What does success look like?"
          value={goalDescription}
          onChangeText={setGoalDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Target date</Text>
        <Pressable style={styles.datePicker} onPress={() => setShowTargetPicker(true)}>
          <Text style={styles.dateText}>{formatDate(targetDate)}</Text>
          <Text style={styles.dateAction}>Pick</Text>
        </Pressable>
        {showTargetPicker ? (
          <DateTimePicker
            value={targetDate ? new Date(targetDate) : new Date()}
            mode="date"
            onChange={handleTargetChange}
          />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Additional context (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Who is involved? Budget limits, tools, constraints..."
          value={context}
          onChangeText={setContext}
          multiline
        />
      </View>

      <Pressable
        style={[styles.generateButton, isGenerateDisabled && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerateDisabled || mutation.isPending}
      >
        <Text style={styles.generateLabel}>
          {manualOnly ? 'Add tasks manually' : mutation.isPending ? 'Generating…' : 'Generate breakdown'}
        </Text>
      </Pressable>

      <Pressable style={styles.manualButton} onPress={handleAddManualTask}>
        <Text style={styles.manualLabel}>+ Add manual task</Text>
      </Pressable>

      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>AI summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}

      {taskDrafts.map((task, index) => (
        <View key={`task-${index}`} style={styles.taskCard}>
          <View style={styles.taskTitleRow}>
            <Text style={styles.label}>Task {index + 1}</Text>
            <Text style={styles.aiBadge}>{task.aiSuggested ? 'AI suggested' : 'Manual'}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={task.title}
            onChangeText={(value) => handleUpdateTask(index, { title: value })}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Add notes"
            value={task.notes}
            onChangeText={(value) => handleUpdateTask(index, { notes: value })}
            multiline
          />
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as Priority[]).map((option) => {
              const isActive = task.priority === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.priorityChip, isActive && styles.priorityChipActive]}
                  onPress={() => handleUpdateTask(index, { priority: option })}
                >
                  <Text style={[styles.priorityText, isActive && styles.priorityTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={styles.datePicker}
            onPress={() => setActiveTaskPicker(index)}
          >
            <Text style={styles.dateText}>{formatDate(task.dueDate)}</Text>
            <Text style={styles.dateAction}>Adjust</Text>
          </Pressable>
          {activeTaskPicker === index ? (
            <DateTimePicker
              value={task.dueDate ? new Date(task.dueDate) : new Date()}
              mode="date"
              onChange={handleTaskDateChange(index)}
            />
          ) : null}
        </View>
      ))}

      <Pressable style={styles.saveButton} onPress={handleSaveGoal}>
        <Text style={styles.saveLabel}>Save plan</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 18,
    backgroundColor: '#F8FAFF'
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B'
  },
  subtitle: {
    fontSize: 15,
    color: '#475569'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15
  },
  multiline: {
    textAlignVertical: 'top',
    minHeight: 80
  },
  datePicker: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 15,
    color: '#1E293B'
  },
  dateAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA'
  },
  generateButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#4338CA'
  },
  generateButtonDisabled: {
    backgroundColor: '#CBD5F5'
  },
  generateLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  manualButton: {
    marginTop: 12,
    alignItems: 'center'
  },
  manualLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    gap: 8
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#312E81'
  },
  summaryText: {
    fontSize: 14,
    color: '#4338CA'
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  aiBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1'
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  priorityChipActive: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA'
  },
  priorityText: {
    fontSize: 13,
    color: '#475569',
    textTransform: 'capitalize'
  },
  priorityTextActive: {
    color: '#FFFFFF'
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center'
  },
  saveLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700'
  }
});
