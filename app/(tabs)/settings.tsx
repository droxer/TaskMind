import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { clearSnapshot } from '@/services/storage';
import { useTaskStore, usePreferences, useSyncMetadata } from '@/state/useTaskStore';

export default function SettingsScreen() {
  const preferences = usePreferences();
  const syncMetadata = useSyncMetadata();
  const setPreferences = useTaskStore((state) => state.setPreferences);
  const [isClearing, setIsClearing] = useState(false);

  const handleToggleGenAi = (value: boolean) => {
    setPreferences({ genAiEnabled: value });
  };

  const handleToggleNotifications = (value: boolean) => {
    setPreferences({ notificationsEnabled: value });
  };

  const handleClearData = async () => {
    Alert.alert(
      'Reset workspace',
      'This removes all cached data on this device. Cloud data remains intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await clearSnapshot();
            useTaskStore.setState({ goals: [], inboxTasks: [] });
            setIsClearing(false);
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>GenAI goal breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable GenAI suggestions</Text>
          <Switch value={preferences.genAiEnabled} onValueChange={handleToggleGenAi} />
        </View>
        <Text style={styles.supportText}>
          Goal descriptions are sent to your configured GenAI provider. Disable to break goals manually.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Due reminders</Text>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
        </View>
        <Text style={styles.supportText}>Configure iOS notification settings to ensure reminders are delivered.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sync status</Text>
        <Text style={styles.label}>State: {syncMetadata.syncStatus}</Text>
        {syncMetadata.lastSyncedAt ? (
          <Text style={styles.supportText}>Last synced {new Date(syncMetadata.lastSyncedAt).toLocaleString()}</Text>
        ) : (
          <Text style={styles.supportText}>No sync recorded yet</Text>
        )}
        {syncMetadata.errorMessage ? (
          <EmptyState title="Sync error" description={syncMetadata.errorMessage} />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data</Text>
        <Text style={styles.label} onPress={handleClearData}>
          {isClearing ? 'Clearing…' : 'Clear cached data'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    backgroundColor: '#F8FAFF'
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 15,
    color: '#111827'
  },
  supportText: {
    fontSize: 13,
    color: '#64748B'
  }
});
