export const CERTS = [
  { k: "prac", t: "Practitioner Certification", s: "Katalon Studio Free or Enterprise", c: "#a855f7", u: "https://academy.katalon.com/certifications/practitioner/" },
  { k: "ai", t: "AI-skilled Practitioner Certification", s: "Katalon Studio Enterprise", c: "#14c8b4", u: "https://academy.katalon.com/certifications/ai-practitioner/" },
  { k: "pro", t: "Professional Certification", s: "Katalon Studio Enterprise", c: "#2f6fed", u: "https://academy.katalon.com/certifications/professional/" },
  { k: "tt", t: "True AI Tester Certification", s: "Katalon True Platform", c: "#f59e0b", u: "https://academy.katalon.com/certifications/true-ai-tester/" },
  { k: "te", t: "True AI Expert Certification", s: "Katalon True Platform + Studio", c: "#e5484d", u: "https://academy.katalon.com/certifications/true-ai-expert/" },
] as const;

export type CertKey = (typeof CERTS)[number]["k"];
export const findCert = (k: string) => CERTS.find((c) => c.k === k);
