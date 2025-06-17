import { en } from "./en";
import { ITranslation } from "./types";

export const translations: Record<string, ITranslation> = {
  en,
};

export const getTranslation = (lang: string): ITranslation => {
  return translations[lang] || translations["en"];
};
