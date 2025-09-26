import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Priority } from '@/types';

interface Props {
  priority: Priority;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const PRIORITY_STYLES: Record<Priority, { backgroundColor: string; color: string }> = {
  high: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  medium: { backgroundColor: '#FEF3C7', color: '#B45309' },
  low: { backgroundColor: '#DCFCE7', color: '#15803D' }
};

function PriorityPillComponent({ priority }: Props) {
  const { backgroundColor, color } = PRIORITY_STYLES[priority];

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <Text style={[styles.text, { color }]}>{PRIORITY_LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  text: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export const PriorityPill = memo(PriorityPillComponent);
