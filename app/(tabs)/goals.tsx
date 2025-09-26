import { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GoalCard } from '@/components/GoalCard';
import { EmptyState } from '@/components/EmptyState';
import { TaskCard } from '@/components/TaskCard';
import { Fab } from '@/components/Fab';
import { useTaskStore, useGoals, useActiveLocale } from '@/state/useTaskStore';
import { t } from '@/i18n';
import type { Task } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function GoalsScreen() {
  const router = useRouter();
  const goals = useGoals();
  const locale = useActiveLocale();
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const handleToggleGoal = (goalId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGoalId((current) => (current === goalId ? null : goalId));
  };

  if (goals.length === 0) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
        accessibilityLanguage={locale}
      >
        <View style={styles.emptyContainer}>
          <EmptyState
            title={t('goals.empty.title')}
            description={t('goals.empty.description')}
          />
          <Fab
            label={t('home.fab.newGoal')}
            icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
            onPress={() => router.push('/goal-wizard')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
      accessibilityLanguage={locale}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{t('goals.title')}</Text>
        <Text style={styles.description}>{t('goals.subtitle')}</Text>

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
                    <Text style={styles.taskListTitle}>{t('goals.taskList.title')}</Text>
                    <Text
                      style={styles.addTask}
                      onPress={() =>
                        router.push({
                          pathname: '/task-editor',
                          params: { goalId: goal.id, goalTitle: goal.title }
                        })
                      }
                    >
                      {t('goals.taskList.add')}
                    </Text>
                  </View>
                  {goal.tasks.length === 0 ? (
                    <Text style={styles.noTasks}>{t('goals.taskList.empty')}</Text>
                  ) : (
                    goal.tasks.map((task: Task) => (
                      <View key={task.id} style={styles.taskWrapper}>
                        <TaskCard task={task} onToggleStatus={(item) => toggleTaskStatus(item.id)} />
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
        label={t('home.fab.newGoal')}
        icon={<Ionicons name="sparkles" size={20} color="#FFFFFF" />}
        onPress={() => router.push('/goal-wizard')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
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
