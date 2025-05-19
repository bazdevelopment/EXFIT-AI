import ar from '@/core/translations/ar.json';
import en from '@/core/translations/en.json';

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

export type Language = keyof typeof resources;
