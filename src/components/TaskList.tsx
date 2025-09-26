import { FlatList, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types';

interface Props {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onToggleStatus?: (task: Task) => void;
  ListEmptyComponent?: React.ReactElement | null;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function TaskList({
  tasks,
  onTaskPress,
  onToggleStatus,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle
}: Props) {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={StyleSheet.flatten([styles.content, contentContainerStyle])}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <TaskCard task={item} onPress={onTaskPress} onToggleStatus={onToggleStatus} />
      )}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
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
