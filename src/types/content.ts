export type Locale = 'ru' | 'en';

export interface Localized {
  ru: string;
  en: string;
}

export interface PhoneContact {
  value: string;
  display: string;
  visible: boolean;
}

export interface EmailContact {
  value: string;
  visible: boolean;
}

export interface TelegramContact {
  handle: string;
  url: string;
  visible: boolean;
}

export interface GithubContact {
  label: string;
  url: string;
}

export interface Contacts {
  phone: PhoneContact;
  email: EmailContact;
  telegram: TelegramContact;
  location: Localized;
  github: GithubContact;
}

export interface Profile {
  schemaVersion: number;
  name: Localized;
  roles: Record<Locale, string[]>;
  contacts: Contacts;
  photo: string | null;
  defaultLocale: Locale;
  locales: Locale[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stack: string[];
  achievements: string[];
  previewImage?: string;
  images?: string[];
}


export interface LocalizedText {
  ru: string;
  en: string;
}

export interface PortfolioLink {
  title: string;
  href: string;
  icon?: string[];
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  timeText: LocalizedText;
  previewImage: string;
  images: string[];
  tags: string[];
  links?: PortfolioLink[];
}

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ExperienceEntry {
  id: string;
  period: string;
  company: string;
  role: string;
  projects?: Project[];
  achievements?: string[];
}

export interface TechGroup {
  id: string;
  label: string;
  items: string[];
}

export interface EducationEntry {
  institution: string;
  specialty: string;
  graduationYear: number;
}

export interface ResumeBase {
  schemaVersion: number;
  locale: Locale;
  about: string;
  keyTechnologies: string[];
  competencies: string[];
  experience: ExperienceEntry[];
  technicalStack: TechGroup[];
  education: EducationEntry[];
  keyAchievements: string[];
  whyMe: string[];
  links: ResumeLink[];
}

export interface ResumeVariant {
  id: string;
  order: number;
  slug: string;
  title: Localized;
  summary: Localized;
  focus: string[];
  highlightProjects: string[];
  experienceOrder: string[];
  skillsOrder: string[];
  deEmphasize: string[];
}

export interface VariantsFile {
  schemaVersion: number;
  defaultLocale: Locale;
  variants: ResumeVariant[];
}
