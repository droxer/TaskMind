import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PriorityPill } from '@/components/PriorityPill';
import { useGoals, useInboxTasks } from '@/state/useTaskStore';
import { Task } from '@/types';
import { formatDate } from '@/utils/date';

interface Section {
  title: string;
  data: Task[];
}

export default function CalendarScreen() {
  const goals = useGoals();
  const inboxTasks = useInboxTasks();

  const sections = useMemo(() => {
    const allTasks: Task[] = [
      ...inboxTasks,
      ...goals.flatMap((goal) => goal.tasks)
    ].filter((task) => Boolean(task.dueDate));

    const grouped = new Map<string, Task[]>();
    allTasks.forEach((task) => {
      const key = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'No due date';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(task);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map<Section>(([key, tasks]) => ({
        title: key,
        data: tasks.sort((left, right) => left.priority.localeCompare(right.priority))
      }));
  }, [goals, inboxTasks]);

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title="No tasks with due dates"
          description="Set due dates to see your schedule view populate."
        />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      contentContainerStyle={styles.content}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{formatDate(section.title)}</Text>
          <Text style={styles.sectionMeta}>{section.data.length} tasks</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
          </View>
          <PriorityPill priority={item.priority} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#F8FAFF',
    paddingBottom: 24
  },
  sectionHeader: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#312E81'
  },
  sectionMeta: {
    fontSize: 13,
    color: '#6366F1'
  },
  item: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  itemText: {
    flex: 1,
    marginRight: 12,
    gap: 4
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  itemNotes: {
    fontSize: 13,
    color: '#64748B'
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
