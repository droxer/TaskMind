import { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GoalCard } from '@/components/GoalCard';
import { EmptyState } from '@/components/EmptyState';
import { TaskCard } from '@/components/TaskCard';
import { Fab } from '@/components/Fab';
import { useTaskStore, useGoals } from '@/state/useTaskStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function GoalsScreen() {
  const router = useRouter();
  const goals = useGoals();
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const handleToggleGoal = (goalId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGoalId((current) => (current === goalId ? null : goalId));
  };

  if (goals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title="No goals yet"
          description="Use the goal wizard to break big objectives into meaningful steps."
        />
        <Fab
          label="New goal"
          icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
          onPress={() => router.push('/goal-wizard')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Goals</Text>
        <Text style={styles.description}>
          Review active plans, tweak due dates, or add manual tasks to any goal.
        </Text>

        {goals.map((goal) => {
          const isExpanded = expandedGoalId === goal.id;
          return (
            <View key={goal.id} style={styles.goalBlock}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleToggleGoal(goal.id)}>
                <GoalCard goal={goal} />
              </TouchableOpacity>
              {isExpanded ? (
                <View style={styles.taskList}>
                  <View style={styles.taskListHeader}>
                    <Text style={styles.taskListTitle}>Tasks</Text>
                    <Text
                      style={styles.addTask}
                      onPress={() =>
                        router.push({
                          pathname: '/task-editor',
                          params: { goalId: goal.id, goalTitle: goal.title }
                        })
                      }
                    >
                      + Add task
                    </Text>
                  </View>
                  {goal.tasks.length === 0 ? (
                    <Text style={styles.noTasks}>No tasks yet. Generate with AI or add manually.</Text>
                  ) : (
                    goal.tasks.map((task) => (
                      <View key={task.id} style={styles.taskWrapper}>
                        <TaskCard task={task} onToggleStatus={toggleTaskStatus} />
                      </View>
                    ))
                  )}
                </View>
              ) : null}
            </View>
          );
        })}
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
  content: {
    padding: 24,
    paddingBottom: 120,
    gap: 20
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#312E81'
  },
  description: {
    fontSize: 15,
    color: '#475569'
  },
  goalBlock: {
    gap: 12
  },
  taskList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  taskListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  addTask: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  noTasks: {
    fontSize: 14,
    color: '#64748B'
  },
  taskWrapper: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFF'
  }
});
