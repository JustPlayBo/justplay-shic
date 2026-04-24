import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from './session.service';

export interface Narration {
  title?: string;
  html: string;
}

export interface ConditionalHint {
  requires: string[];
  html: string;
}

export interface PlaceHint {
  default?: string;
  conditional?: ConditionalHint[];
}

export interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
  rationale?: string;
}

export interface QuestionSet {
  title: string;
  items: Question[];
}

export interface PathStep {
  at?: string;
  title: string;
  description?: string;
  gains?: string[];
}

export interface SherlockPath {
  title?: string;
  steps: PathStep[];
}

export interface Adventure {
  id?: string;
  title?: string;
  version?: number;
  intro?: Narration;
  solution?: Narration | string;
  places: Record<string, string | PlaceHint>;
  questions?: {
    primary?: QuestionSet;
    secondary?: QuestionSet;
  };
  sherlockPath?: SherlockPath;
}

const EMPTY_HINT = 'Non ci sono indizi in questo punto della mappa.';

@Injectable({
  providedIn: 'root'
})
export class AdventureService {

  adventure: Adventure | null = null;
  selected = false;

  constructor(
    private http: HttpClient,
    private session: SessionService,
  ) { }

  getAdventures() {
    try {
      return this.http.get('https://adventures.sherlock.justplaybo.it/adventures')
        .pipe(
          catchError((err: HttpErrorResponse) => of([]))
        );
    } catch (ex) {
      return of([]);
    }
  }

  getAdventure(id) {
    this.http.get<Adventure>(`https://adventures.sherlock.justplaybo.it/adventures/${id}`).subscribe(
      data => this.loadAdventure(data)
    );
  }

  loadAdventure(adv: Adventure): void {
    if (!adv || typeof adv !== 'object' || typeof adv.places !== 'object') {
      throw new Error('Formato avventura non valido: manca "places".');
    }
    this.adventure = adv;
    this.selected = true;
  }

  unloadAdventure(): void {
    this.adventure = null;
    this.selected = false;
  }

  get adventureSelected() {
    return this.selected;
  }

  getIntro(): Narration | null {
    const intro = this.adventure?.intro;
    if (!intro) return null;
    return typeof intro === 'string' ? { html: intro } : intro;
  }

  getSolution(): Narration | null {
    const sol = this.adventure?.solution;
    if (!sol) return null;
    return typeof sol === 'string' ? { html: sol } : sol;
  }

  getQuestionSets(): QuestionSet[] {
    const q = this.adventure?.questions;
    if (!q) return [];
    const sets: QuestionSet[] = [];
    if (q.primary) sets.push(q.primary);
    if (q.secondary) sets.push(q.secondary);
    return sets;
  }

  getSherlockPath(): SherlockPath | null {
    return this.adventure?.sherlockPath ?? null;
  }

  getHint(place: string): string {
    const places = this.adventure?.places;
    if (!places || !(place in places)) return EMPTY_HINT;

    const entry = places[place];
    if (typeof entry === 'string') return entry;

    const held = new Set(Object.keys(this.session.current?.clues ?? {}));
    const parts: string[] = [];
    if (entry.default) parts.push(entry.default);
    for (const c of entry.conditional ?? []) {
      if (c.requires.every(letter => held.has(letter.toUpperCase()))) {
        parts.push(c.html);
      }
    }
    return parts.length ? parts.join('\n') : EMPTY_HINT;
  }

  solveAdventure() {
    const sol = this.getSolution();
    return sol?.html ?? '';
  }

  beginAdventure() {
    const intro = this.getIntro();
    return intro?.html ?? '';
  }
}
