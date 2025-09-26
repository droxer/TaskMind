import { FlatList, StyleSheet, View } from 'react-native';

import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types';

interface Props {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onToggleStatus?: (task: Task) => void;
  ListEmptyComponent?: React.ReactElement | null;
}

export function TaskList({ tasks, onTaskPress, onToggleStatus, ListEmptyComponent }: Props) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <TaskCard task={item} onPress={onTaskPress} onToggleStatus={onToggleStatus} />
      )}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 16,
    gap: 12
  },
  separator: {
    height: 12
  }
});
