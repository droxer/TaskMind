import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/providers/AppProviders';
import { useHydratedStore, useActiveLocale, usePreferences } from '@/state/useTaskStore';
import { applyLocalePreference, t } from '@/i18n';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const preferences = usePreferences();
  const locale = useActiveLocale();
  useHydratedStore();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  useEffect(() => {
    applyLocalePreference(preferences.language);
  }, [preferences.language]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} accessibilityLanguage={locale}>
      <AppProviders>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="goal-wizard"
              options={{
                title: t('goalWizard.title'),
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="task-editor"
              options={{
                title: t('taskEditor.title'),
                presentation: 'modal'
              }}
            />
          </Stack>
        </ThemeProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
