import ar from '@/core/translations/ar.json';
import en from '@/core/translations/en.json';
import hi from '@/core/translations/hi.json';

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  hi: {
    translation: hi,
  },
};

export type Language = keyof typeof resources;
