import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Priority } from '@/types';
import { t, PRIORITY_LABEL_KEYS, type TranslationKey } from '@/i18n';
import { useActiveLocale } from '@/state/useTaskStore';

const FILTERS: Array<{ key: Priority | 'all'; labelKey: TranslationKey }> = [
  { key: 'all', labelKey: 'filters.all' },
  { key: 'high', labelKey: PRIORITY_LABEL_KEYS.high },
  { key: 'medium', labelKey: PRIORITY_LABEL_KEYS.medium },
  { key: 'low', labelKey: PRIORITY_LABEL_KEYS.low }
];

interface Props {
  activeFilter: Priority | 'all';
  onChange: (value: Priority | 'all') => void;
}

function TaskFilterBarComponent({ activeFilter, onChange }: Props) {
  const locale = useActiveLocale();
  const filters = useMemo(() => FILTERS.map((filter) => ({ ...filter })), [locale]);
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => onChange(filter.key)}
          >
            <Text style={[styles.chipLabel, isActive && styles.activeChipLabel]}>
              {t(filter.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5'
  },
  activeChip: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA'
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  activeChipLabel: {
    color: '#FFFFFF'
  }
});

export const TaskFilterBar = memo(TaskFilterBarComponent);
