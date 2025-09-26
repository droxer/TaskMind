import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GoalWithTasks } from '@/types';
import { formatDate } from '@/utils/date';

interface Props {
  goal: GoalWithTasks;
  onPress?: (goal: GoalWithTasks) => void;
}

function GoalCardComponent({ goal, onPress }: Props) {
  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter((task) => task.status === 'done').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <Pressable onPress={() => onPress?.(goal)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.status}>{progress}%</Text>
      </View>
      {goal.description ? <Text style={styles.description}>{goal.description}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.meta}>Tasks · {completedTasks}/{totalTasks}</Text>
        <Text style={styles.meta}>{formatDate(goal.targetDate)}</Text>
      </View>
      {goal.aiSummary ? <Text style={styles.aiSummary}>{goal.aiSummary}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    padding: 16,
    gap: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B'
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4338CA'
  },
  description: {
    fontSize: 14,
    color: '#4338CA'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  meta: {
    fontSize: 13,
    color: '#312E81'
  },
  aiSummary: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6D28D9'
  }
});

export const GoalCard = memo(GoalCardComponent);
