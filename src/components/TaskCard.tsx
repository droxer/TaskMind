import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PriorityPill } from '@/components/PriorityPill';
import { Task } from '@/types';
import { daysUntil, formatDate } from '@/utils/date';
import { t } from '@/i18n';
import { useActiveLocale } from '@/state/useTaskStore';

interface Props {
  task: Task;
  onPress?: (task: Task) => void;
  onToggleStatus?: (task: Task) => void;
}

function TaskCardComponent({ task, onPress, onToggleStatus }: Props) {
  const locale = useActiveLocale();
  const dueIn = daysUntil(task.dueDate);
  const dueColor = dueIn !== null && dueIn < 0 ? styles.overdue : undefined;

  return (
    <Pressable onPress={() => onPress?.(task)} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{task.title}</Text>
        <PriorityPill priority={task.priority} />
      </View>
      {task.notes ? <Text style={styles.notes}>{task.notes}</Text> : null}
      <View style={styles.footerRow}>
        <Pressable
          hitSlop={12}
          style={styles.statusButton}
          onPress={() => onToggleStatus?.(task)}
        >
          <Text style={styles.statusText}>
            {task.status === 'done' ? t('taskCard.markIncomplete') : t('taskCard.complete')}
          </Text>
        </Pressable>
        <Text style={[styles.dueText, dueColor]}>{formatDate(task.dueDate, locale)}</Text>
      </View>
      {task.aiSuggested ? <Text style={styles.aiTag}>{t('taskCard.aiSuggested')}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flexShrink: 1,
    marginRight: 12
  },
  notes: {
    color: '#475569',
    fontSize: 14
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#CBD5F5'
  },
  statusText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '500'
  },
  dueText: {
    color: '#1E293B',
    fontWeight: '500'
  },
  overdue: {
    color: '#B91C1C'
  },
  aiTag: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1'
  }
});

export const TaskCard = memo(TaskCardComponent);
