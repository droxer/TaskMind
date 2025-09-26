import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Priority } from '@/types';
import { priorityLabel } from '@/i18n';
import { useActiveLocale } from '@/state/useTaskStore';

interface Props {
  priority: Priority;
}

const PRIORITY_STYLES: Record<Priority, { backgroundColor: string; color: string }> = {
  high: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  medium: { backgroundColor: '#FEF3C7', color: '#B45309' },
  low: { backgroundColor: '#DCFCE7', color: '#15803D' }
};

function PriorityPillComponent({ priority }: Props) {
  const locale = useActiveLocale();
  const { backgroundColor, color } = PRIORITY_STYLES[priority];
  const label = useMemo(() => priorityLabel(priority), [priority, locale]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
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
