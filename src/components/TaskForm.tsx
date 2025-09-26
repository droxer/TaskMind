import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Priority, Task } from '@/types';
import { t, PRIORITY_LABEL_KEYS } from '@/i18n';
import { formatDate } from '@/utils/date';
import { useActiveLocale } from '@/state/useTaskStore';

interface Props {
  initialTask?: Partial<Task>;
  onSubmit: (task: Partial<Task>) => void;
  submitLabel?: string;
}

const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high'];

export function TaskForm({ initialTask, onSubmit, submitLabel = t('taskForm.submit') }: Props) {
  const locale = useActiveLocale();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [notes, setNotes] = useState(initialTask?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<string | undefined>(initialTask?.dueDate);
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate.toISOString());
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }
    onSubmit({
      ...initialTask,
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      dueDate
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>{t('taskForm.titleLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('taskForm.titlePlaceholder')}
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('taskForm.notesLabel')}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder={t('taskForm.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('taskForm.priorityLabel')}</Text>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((option) => {
            const isActive = option === priority;
            return (
              <Pressable
                key={option}
                onPress={() => setPriority(option)}
                style={[styles.priorityChip, isActive && styles.priorityChipActive]}
              >
                <Text style={[styles.priorityLabel, isActive && styles.priorityLabelActive]}>
                  {t(PRIORITY_LABEL_KEYS[option])}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>{t('taskForm.dueDateLabel')}</Text>
        <Pressable style={styles.duePicker} onPress={() => setShowPicker(true)}>
          <Text style={styles.dueLabel}>{formatDate(dueDate, locale)}</Text>
          <Text style={styles.dueChange}>{t('common.pick')}</Text>
        </Pressable>
        {showPicker ? (
          <DateTimePicker
            value={dueDate ? new Date(dueDate) : new Date()}
            mode="date"
            onChange={handleDateChange}
          />
        ) : null}
      </View>
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitLabel}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 24
  },
  field: {
    gap: 8
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF'
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12
  },
  priorityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#94A3B8'
  },
  priorityChipActive: {
    backgroundColor: '#4338CA',
    borderColor: '#4338CA'
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  priorityLabelActive: {
    color: '#FFFFFF'
  },
  duePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF'
  },
  dueLabel: {
    fontSize: 15,
    color: '#1E293B'
  },
  dueChange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA'
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: '#4338CA',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center'
  },
  submitLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
