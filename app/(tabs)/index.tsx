import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { TaskFilterBar } from '@/components/TaskFilterBar';
import { TaskList } from '@/components/TaskList';
import { useInboxTasks } from '@/state/useTaskStore';
import { Priority } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const tasks = useInboxTasks();
  const [filter, setFilter] = useState<Priority | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.priority === filter);
  }, [tasks, filter]);

  const completed = tasks.filter((task) => task.status === 'done').length;
  const total = tasks.length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Today&apos;s Focus</Text>
            <Text style={styles.subtitle}>Stay in control of your priorities</Text>
          </View>
          <View style={styles.progressBubble}>
            <Text style={styles.progressValue}>{total === 0 ? 0 : Math.round((completed / total) * 100)}%</Text>
            <Text style={styles.progressLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <View style={styles.actionCard}>
            <Ionicons name="sparkles" size={20} color="#4338CA" />
            <Text style={styles.actionTitle}>Goal wizard</Text>
            <Text style={styles.actionDescription}>Describe your goal and let GenAI plan the steps.</Text>
            <Text style={styles.actionLink} onPress={() => router.push('/goal-wizard')}>
              Start breakdown →
            </Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="add-circle" size={20} color="#0EA5E9" />
            <Text style={styles.actionTitle}>Quick task</Text>
            <Text style={styles.actionDescription}>Capture a task manually with priority and due date.</Text>
            <Text style={styles.actionLink} onPress={() => router.push('/task-editor')}>
              Add task →
            </Text>
          </View>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inbox tasks</Text>
            <Text style={styles.sectionMeta}>{total} total</Text>
          </View>
          <TaskFilterBar activeFilter={filter} onChange={setFilter} />
          <TaskList
            tasks={filteredTasks}
            ListEmptyComponent={
              <EmptyState
                title="Nothing scheduled yet"
                description="Add a quick task or run the goal wizard to get started."
              />
            }
          />
        </View>
      </ScrollView>

      <Fab
        label="New goal"
        icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
        onPress={() => router.push('/goal-wizard')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
    gap: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A'
  },
  subtitle: {
    fontSize: 15,
    color: '#475569'
  },
  progressBubble: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center'
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#312E81'
  },
  progressLabel: {
    fontSize: 12,
    color: '#4338CA'
  },
  quickActions: {
    gap: 16
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  actionDescription: {
    fontSize: 14,
    color: '#475569'
  },
  actionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937'
  },
  sectionMeta: {
    fontSize: 13,
    color: '#64748B'
  }
});
