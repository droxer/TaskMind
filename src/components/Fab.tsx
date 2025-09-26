import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
}

export function Fab({ label, icon, onPress }: Props) {
  const insets = useSafeAreaInsets();
  const wrapperStyle = {
    bottom: 24 + (insets.bottom > 0 ? insets.bottom - 8 : 0),
    right: 24 + (insets.right > 0 ? insets.right : 0)
  };
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <Pressable onPress={onPress} style={styles.button}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24
  },
  button: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1F2937',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6
  },
  label: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600'
  }
});
