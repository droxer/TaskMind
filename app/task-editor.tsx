import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { TaskForm } from '@/components/TaskForm';
import { useTaskStore } from '@/state/useTaskStore';

export default function TaskEditorScreen() {
  const router = useRouter();
  const { goalId, goalTitle } = useLocalSearchParams<{
    goalId?: string;
    goalTitle?: string;
  }>();
  const createTask = useTaskStore((state) => state.createTask);

  return (
    <View style={styles.container}>
      {goalTitle ? <Text style={styles.context}>Adding to {goalTitle}</Text> : null}
      <TaskForm
        submitLabel="Save"
        onSubmit={(task) => {
          if (!task.title) {
            return;
          }
          createTask({
            title: task.title,
            notes: task.notes,
            priority: task.priority,
            dueDate: task.dueDate,
            goalId
          });
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
  context: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
    textAlign: 'center',
    paddingTop: 18
  }
});
