import { en } from './en';
import { ru } from './ru';
import type { UI } from './ui';
import type { Locale } from '../types/content';

const dictionaries: Record<Locale, UI> = { ru, en };

export function getUI(locale: Locale): UI {
  return dictionaries[locale] ?? dictionaries.ru;
}

export type { UI };
