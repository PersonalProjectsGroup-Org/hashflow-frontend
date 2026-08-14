import i18next, { type InitOptions, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import ptBR from '../locales/pt-BR.json';

/** Default locale — English, per spec Appendix A ("English is the default locale"). */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Supported locales. Adding a language means:
 * 1. adding a `<code>.json` file under `src/locales/` with the same keys,
 * 2. registering it here and in {@link RESOURCES}.
 */
export const SUPPORTED_LANGUAGES = ['en', 'pt-BR'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const RESOURCES: Resource = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
};

export const DEFAULT_I18N_OPTIONS: InitOptions = {
  resources: RESOURCES,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    // React already escapes values; i18next double-escaping would show raw entities.
    escapeValue: false,
    // Spec Appendix A copy uses single-brace placeholders (`{n}`, `{online}`),
    // while i18next defaults to `{{double}}` braces.
    prefix: '{',
    suffix: '}',
  },
  // Missing keys surface as the key string instead of `null` (easier to spot in UI/tests).
  returnNull: false,
};

/**
 * Factory kept separate from the singleton so tests can spin up isolated
 * instances (the app-wide client is {@link i18n}).
 */
export function createI18n(options: InitOptions = {}): typeof i18next {
  const instance = i18next.createInstance();
  void instance
    .use(initReactI18next)
    .init({ ...DEFAULT_I18N_OPTIONS, ...options });
  return instance;
}

/** App-wide i18next instance, bound to react-i18next for `useTranslation`. */
export const i18n = createI18n();
