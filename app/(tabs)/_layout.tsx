import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { t, type TranslationKey } from '@/i18n';
import { useActiveLocale } from '@/state/useTaskStore';

const TAB_LABEL_KEYS: Record<string, TranslationKey> = {
  index: 'tabs.home',
  goals: 'tabs.goals',
  calendar: 'tabs.calendar',
  settings: 'tabs.settings'
};

export default function TabsLayout() {
  useActiveLocale();
  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: '#F8FAFF' }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarAccessibilityLabel: t(TAB_LABEL_KEYS[route.name] ?? 'tabs.home'),
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <Ionicons name="home" size={size} color={color} />;
            case 'goals':
              return <Ionicons name="flag" size={size} color={color} />;
            case 'calendar':
              return <Ionicons name="calendar" size={size} color={color} />;
            case 'settings':
              return <Ionicons name="settings" size={size} color={color} />;
            default:
              return <Ionicons name="ellipse" size={size} color={color} />;
          }
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="goals" options={{ title: t('tabs.goals') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
