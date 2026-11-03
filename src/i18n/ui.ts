export interface UI {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    portfolio: string;
    resumes: string;
    projects: string;
    contacts: string;
  };
  hero: {
    greeting: string;
    available: string;
    ctaResumes: string;
    ctaContact: string;
  };
  sections: {
    about: string;
    resumes: string;
    projects: string;
    achievements: string;
    whyMe: string;
    experience: string;
    education: string;
    contacts: string;
    recommendations: string;
    competencies: string;
    stack: string;
  };
  labels: {
    keyTech: string;
    stack: string;
    selectedProjects: string;
    allResumes: string;
    backToPortfolio: string;
    print: string;
    otherResumes: string;
    location: string;
    present: string;
    email: string;
    phone: string;
    telegram: string;
    github: string;
    highlights: string;
    openResume: string;
    skipToContent: string;
  };
  theme: {
    toggle: string;
    dark: string;
    light: string;
  };
  language: {
    label: string;
    switchTo: string;
  };
  footer: {
    copyright: string;
    builtWith: string;
    sourceCode: string;
  };
  variantDescriptions: Record<string, string>;
  focusLabels: Record<string, string>;
  contactIntro: string;
  resumeNote: string;
  notFound: {
    title: string;
    text: string;
    home: string;
  };
}
