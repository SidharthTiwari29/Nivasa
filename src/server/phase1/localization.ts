export const SUPPORTED_LOCALES = [
  "en-IN",
  "hi-IN",
  "kn-IN",
  "ta-IN",
  "te-IN",
  "ml-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
  "pa-IN",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizedText = Partial<Record<SupportedLocale, string>> & {
  "en-IN": string;
};

export function normalizeLocale(locale?: string): SupportedLocale {
  if (!locale) return "en-IN";
  const normalized = locale.toLowerCase().replace("_", "-");
  const match = SUPPORTED_LOCALES.find((candidate) => candidate.toLowerCase() === normalized);
  return match ?? "en-IN";
}

export function resolveLocalizedText(text: LocalizedText, locale?: string): string {
  const selected = normalizeLocale(locale);
  return text[selected] ?? text["en-IN"];
}

export type LanguagePreference = {
  locale: SupportedLocale;
  allowCodeSwitching: boolean;
};

export function normalizeLanguagePreference(input: Partial<LanguagePreference>): LanguagePreference {
  return {
    locale: normalizeLocale(input.locale),
    allowCodeSwitching: input.allowCodeSwitching ?? true,
  };
}
