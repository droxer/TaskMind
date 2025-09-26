import { I18n, type TranslateOptions } from 'i18n-js';
import * as Localization from 'expo-localization';

import { en, type TranslationKey } from './locales/en';
import { zhHans } from './locales/zh-Hans';
import type { LanguagePreference, Priority } from '@/types';

const translations = {
  en,
  zh: zhHans,
  'zh-Hans': zhHans
} as const;

export type SupportedLocale = keyof typeof translations;
export type LocalePreference = LanguagePreference;

export const LOCALE_NATIVE_NAMES: Record<LocalePreference, string> = {
  en: 'English',
  zh: '简体中文',
  system: 'Auto'
};

export const PRIORITY_LABEL_KEYS: Record<Priority, TranslationKey> = {
  high: 'priority.high',
  medium: 'priority.medium',
  low: 'priority.low'
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function coerceLocalePreference(preference?: string | null): LocalePreference {
  if (preference === 'en') {
    return 'en';
  }
  if (preference === 'zh' || preference === 'zh-Hans') {
    return 'zh';
  }
  return 'system';
}

export function resolveLocale(preference: LocalePreference = 'system'): SupportedLocale {
  if (preference !== 'system' && preference in translations) {
    return preference as SupportedLocale;
  }
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const tag = locale.languageTag?.replace('_', '-');
    if (tag && tag in translations) {
      return tag as SupportedLocale;
    }
    if (locale.languageCode === 'zh') {
      return 'zh';
    }
    if (locale.languageCode === 'en') {
      return 'en';
    }
  }
  return 'en';
}

i18n.locale = resolveLocale();

export function setLocale(locale: SupportedLocale) {
  i18n.locale = locale;
}

export function applyLocalePreference(preference: LocalePreference): SupportedLocale {
  const locale = resolveLocale(preference);
  setLocale(locale);
  return locale;
}

export function t(key: TranslationKey, options?: TranslateOptions): string {
  return i18n.t(key, { defaultValue: en[key], ...options });
}

export const currentLocale = (): string => i18n.locale;

export function priorityLabel(priority: Priority): string {
  return t(PRIORITY_LABEL_KEYS[priority]);
}

export type { TranslationKey };
