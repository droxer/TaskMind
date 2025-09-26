import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Priority } from '@/types';

const FILTERS: Array<{ key: Priority | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' }
];

interface Props {
  activeFilter: Priority | 'all';
  onChange: (value: Priority | 'all') => void;
}

function TaskFilterBarComponent({ activeFilter, onChange }: Props) {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <Pressable
            key={filter.key}
            style={[styles.chip, isActive && styles.activeChip]}
            onPress={() => onChange(filter.key)}
          >
            <Text style={[styles.chipLabel, isActive && styles.activeChipLabel]}>{filter.label}</Text>
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
