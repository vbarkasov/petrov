import profileJson from '../data/profile.json';
import baseRu from '../data/resume/base.ru.json';
import baseEn from '../data/resume/base.en.json';
import variantsJson from '../data/resume/variants.json';
import type {
  Locale,
  Profile,
  ResumeBase,
  ResumeVariant,
  VariantsFile,
} from '../types/content';

const profile = profileJson as Profile;
const resumes: Record<Locale, ResumeBase> = {
  ru: baseRu as ResumeBase,
  en: baseEn as ResumeBase,
};
const variantsFile = variantsJson as unknown as VariantsFile;

export function getProfile(): Profile {
  return profile;
}

export function getResume(locale: Locale): ResumeBase {
  return resumes[locale] ?? resumes.ru;
}

export function getVariants(): ResumeVariant[] {
  return [...variantsFile.variants].sort((a, b) => a.order - b.order);
}

export function getVariant(slug: string): ResumeVariant | undefined {
  return variantsFile.variants.find((variant) => variant.slug === slug);
}
