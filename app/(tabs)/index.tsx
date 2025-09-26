import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/EmptyState';
import { Fab } from '@/components/Fab';
import { TaskFilterBar } from '@/components/TaskFilterBar';
import { TaskList } from '@/components/TaskList';
import { useInboxTasks, useActiveLocale } from '@/state/useTaskStore';
import { Priority } from '@/types';
import { t } from '@/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const tasks = useInboxTasks();
  const locale = useActiveLocale();
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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
      accessibilityLanguage={locale}
    >
      <View style={styles.container}>
        <TaskList
          tasks={filteredTasks}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>{t('home.title')}</Text>
                  <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
                </View>
                <View style={styles.progressBubble}>
                  <Text style={styles.progressValue}>
                    {total === 0 ? 0 : Math.round((completed / total) * 100)}%
                  </Text>
                  <Text style={styles.progressLabel}>{t('home.doneLabel')}</Text>
                </View>
              </View>

              <View style={styles.quickActions}>
                <View style={styles.actionCard}>
                  <Ionicons name="sparkles" size={20} color="#4338CA" />
                  <Text style={styles.actionTitle}>{t('home.goalWizard.title')}</Text>
                  <Text style={styles.actionDescription}>{t('home.goalWizard.description')}</Text>
                  <Text style={styles.actionLink} onPress={() => router.push('/goal-wizard')}>
                    {t('home.goalWizard.cta')}
                  </Text>
                </View>
                <View style={styles.actionCard}>
                  <Ionicons name="add-circle" size={20} color="#0EA5E9" />
                  <Text style={styles.actionTitle}>{t('home.quickTask.title')}</Text>
                  <Text style={styles.actionDescription}>{t('home.quickTask.description')}</Text>
                  <Text style={styles.actionLink} onPress={() => router.push('/task-editor')}>
                    {t('home.quickTask.cta')}
                  </Text>
                </View>
              </View>

              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('home.section.inboxTitle')}</Text>
                  <Text style={styles.sectionMeta}>{t('home.section.inboxMeta', { count: total })}</Text>
                </View>
                <TaskFilterBar activeFilter={filter} onChange={setFilter} />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <EmptyState
                title={t('home.empty.title')}
                description={t('home.empty.description')}
              />
            </View>
          }
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24
  },
  headerSection: {
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
  },
  emptyState: {
    paddingVertical: 48
  }
});
