import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { clearSnapshot } from '@/services/storage';
import {
  useTaskStore,
  usePreferences,
  useSyncMetadata,
  useActiveLocale
} from '@/state/useTaskStore';
import {
  t,
  LOCALE_NATIVE_NAMES,
  type TranslationKey,
  type LocalePreference
} from '@/i18n';
import type { SyncMetadata } from '@/types';

const SYNC_STATUS_LABEL_KEYS: Record<SyncMetadata['syncStatus'], TranslationKey> = {
  pending: 'settings.sync.status.pending',
  in_flight: 'settings.sync.status.in_flight',
  synced: 'settings.sync.status.synced',
  error: 'settings.sync.status.error'
};

export default function SettingsScreen() {
  const preferences = usePreferences();
  const syncMetadata = useSyncMetadata();
  const locale = useActiveLocale();
  const setPreferences = useTaskStore((state) => state.setPreferences);
  const [isClearing, setIsClearing] = useState(false);

  const languageOptions: Array<{ value: LocalePreference; label: string }> = [
    { value: 'system', label: t('settings.language.option.system') },
    ...Object.entries(LOCALE_NATIVE_NAMES)
      .filter(([value]) => value !== 'system')
      .map(([value, label]) => ({
        value: value as LocalePreference,
        label: label as string
      }))
  ];

  const handleToggleGenAi = (value: boolean) => {
    setPreferences({ genAiEnabled: value });
  };

  const handleToggleNotifications = (value: boolean) => {
    setPreferences({ notificationsEnabled: value });
  };

  const handleSelectLanguage = (value: LocalePreference) => {
    if (preferences.language === value) {
      return;
    }
    setPreferences({ language: value });
  };

  const handleClearData = async () => {
    Alert.alert(
      t('settings.data.resetConfirmTitle'),
      t('settings.data.resetConfirmMessage'),
      [
        { text: t('settings.data.resetConfirmCancel'), style: 'cancel' },
        {
          text: t('settings.data.resetConfirmAction'),
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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
      accessibilityLanguage={locale}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{t('settings.title')}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.genai.cardTitle')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('settings.genai.toggle')}</Text>
            <Switch value={preferences.genAiEnabled} onValueChange={handleToggleGenAi} />
          </View>
          <Text style={styles.supportText}>{t('settings.genai.support')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.notifications.cardTitle')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('settings.notifications.toggle')}</Text>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
          </View>
          <Text style={styles.supportText}>{t('settings.notifications.support')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.language.cardTitle')}</Text>
          <Text style={styles.supportText}>{t('settings.language.support')}</Text>
          <View style={styles.optionGroup}>
            {languageOptions.map((option) => {
              const isSelected = preferences.language === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelectLanguage(option.value)}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.label, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <View
                    style={[styles.optionIndicator, isSelected && styles.optionIndicatorSelected]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.sync.cardTitle')}</Text>
          <Text style={styles.label}>
            {t('settings.sync.state', { status: t(SYNC_STATUS_LABEL_KEYS[syncMetadata.syncStatus]) })}
          </Text>
          {syncMetadata.lastSyncedAt ? (
            <Text style={styles.supportText}>
              {t('settings.sync.lastSynced', {
                timestamp: new Date(syncMetadata.lastSyncedAt).toLocaleString()
              })}
            </Text>
          ) : (
            <Text style={styles.supportText}>{t('settings.sync.none')}</Text>
          )}
          {syncMetadata.errorMessage ? (
            <EmptyState
              title={t('settings.sync.errorTitle')}
              description={syncMetadata.errorMessage}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings.data.cardTitle')}</Text>
          <Text style={styles.label} onPress={handleClearData}>
            {isClearing ? t('settings.data.clearing') : t('settings.data.clear')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF'
  },
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
  },
  optionGroup: {
    gap: 12
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF'
  },
  optionRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF'
  },
  optionLabelSelected: {
    fontWeight: '600'
  },
  optionIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5F5',
    backgroundColor: '#FFFFFF'
  },
  optionIndicatorSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB'
  }
});
