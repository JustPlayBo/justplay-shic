import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'shic.lang';
export const SUPPORTED_LANGS = ['it', 'en'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private translate: TranslateService) {}

  init(): void {
    this.translate.addLangs(SUPPORTED_LANGS as unknown as string[]);
    this.translate.setDefaultLang('it');
    this.translate.use(this.detectInitial());
  }

  current(): Lang {
    return (this.translate.currentLang as Lang) || 'it';
  }

  use(lang: Lang): void {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this.translate.use(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }

  private detectInitial(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    } catch {}
    const browser = (navigator.language || 'it').slice(0, 2).toLowerCase() as Lang;
    return SUPPORTED_LANGS.includes(browser) ? browser : 'it';
  }
}
