import { describe, expect, it } from 'vitest';

import en from '../../src/locales/en.json';
import ptBR from '../../src/locales/pt-BR.json';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  createI18n,
} from '../../src/lib/i18n';

/** Collects every leaf key of a nested translations object, dotted (e.g. `header.live`). */
function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function sortedKeys(value: unknown): string[] {
  return collectKeys(value).sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getByPath(locale: Record<string, unknown>, key: string): unknown {
  let node: unknown = locale;
  for (const part of key.split('.')) {
    if (!isRecord(node)) return undefined;
    node = node[part];
  }
  return node;
}

describe('locale key parity', () => {
  it('en and pt-BR expose the exact same key set', () => {
    expect(sortedKeys(en)).toEqual(sortedKeys(ptBR));
  });

  it('every leaf value is a string (interpolations are inline braces)', () => {
    for (const locale of [en, ptBR]) {
      for (const key of collectKeys(locale)) {
        expect(typeof getByPath(locale, key), `${key} must be a string`).toBe(
          'string',
        );
      }
    }
  });
});

describe('createI18n', () => {
  it('defaults to English', () => {
    const instance = createI18n();
    expect(instance.language).toBe(DEFAULT_LANGUAGE);
    expect(instance.t('header.live')).toBe('Live');
    expect(instance.t('section.rigSupervision')).toBe('Rig Supervision');
  });

  it('switches to pt-BR and back', async () => {
    const instance = createI18n();
    await instance.changeLanguage('pt-BR');
    expect(instance.t('header.live')).toBe('Ao vivo');
    expect(instance.t('section.rigSupervision')).toBe('Supervisão de Rigs');
    expect(instance.t('alerts.noAlerts')).toBe('Nenhum alerta');
    expect(instance.t('header.editKwh')).toBe('Clique para editar kWh');
    expect(instance.t('header.telemetryTicker')).toBe(
      'Telemetria a cada 10s · Preços a cada 30s',
    );

    await instance.changeLanguage('en');
    expect(instance.t('header.live')).toBe('Live');
  });

  it('supports the two registered languages and no others', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'pt-BR']);
    expect(DEFAULT_LANGUAGE).toBe('en');
  });

  it('falls back to English for unsupported languages', async () => {
    const instance = createI18n({ lng: 'de' });
    expect(instance.t('header.live')).toBe('Live');
  });

  it('returns the key for unknown keys instead of null', () => {
    const instance = createI18n();
    expect(instance.t('header.doesNotExist')).toBe('header.doesNotExist');
  });
});

describe('interpolation', () => {
  it('interpolates count and fraction params in both locales', async () => {
    const enInstance = createI18n();
    expect(enInstance.t('header.switchCount', { n: 3 })).toBe(
      '3 switch suggestions',
    );
    expect(enInstance.t('header.rigsCount', { online: 2, total: 4 })).toBe(
      'Rigs: 2/4',
    );
    expect(enInstance.t('rigCard.uptime', { value: '12d 4h' })).toBe(
      'Uptime: 12d 4h',
    );
    expect(enInstance.t('time.minutesAgo', { n: 1 })).toBe('1m ago');

    const ptInstance = createI18n({ lng: 'pt-BR' });
    expect(ptInstance.t('header.switchCount', { n: 3 })).toBe(
      '3 sugestões de troca',
    );
    expect(ptInstance.t('time.minutesAgo', { n: 1 })).toBe('1m atrás');
  });

  it('is locale-invariant for status badges and units per spec', () => {
    const instance = createI18n({ lng: 'pt-BR' });
    expect(instance.t('status.online')).toBe('Online');
    expect(instance.t('status.throttling')).toBe('Throttling');
    expect(instance.t('status.offline')).toBe('Offline');
  });
});
