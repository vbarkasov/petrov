import type { Locale } from '../types/content';

const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function homePath(locale: Locale): string {
  return `${base}/${locale}/`;
}

export function resumePath(locale: Locale, slug: string): string {
  return `${base}/${locale}/resume/${slug}/`;
}

export function withBase(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function pick<T>(value: { ru: T; en: T }, locale: Locale): T {
  return value[locale] ?? value.ru;
}
