import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'shic.session';

export interface VisitedEntry {
  at: string;
  note?: string;
}

export interface ClueEntry {
  at: string;
  where?: string;
}

export interface AnswerEntry {
  correct: boolean;
  at: string;
}

export interface Session {
  startedAt: string;
  visited: Record<string, VisitedEntry>;
  clues: Record<string, ClueEntry>;
  answers: Record<string, AnswerEntry>;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private subject = new BehaviorSubject<Session | null>(this.load());
  readonly session$: Observable<Session | null> = this.subject.asObservable();

  get current(): Session | null {
    return this.subject.value;
  }

  isActive(): boolean {
    return this.subject.value !== null;
  }

  startNew(): void {
    this.persist({ startedAt: new Date().toISOString(), visited: {}, clues: {}, answers: {} });
  }

  clear(): void {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    this.subject.next(null);
  }

  isVisited(id: string): boolean {
    const s = this.subject.value;
    return !!(s && s.visited[id]);
  }

  getEntry(id: string): VisitedEntry | undefined {
    return this.subject.value?.visited[id];
  }

  markVisited(id: string): void {
    const s = this.subject.value;
    if (!s || s.visited[id]) return;
    s.visited[id] = { at: new Date().toISOString() };
    this.persist(s);
  }

  unmarkVisited(id: string): void {
    const s = this.subject.value;
    if (!s || !s.visited[id]) return;
    delete s.visited[id];
    this.persist(s);
  }

  setNote(id: string, note: string): void {
    const s = this.subject.value;
    if (!s) return;
    const entry = s.visited[id] ?? { at: new Date().toISOString() };
    const trimmed = note.trim();
    if (trimmed) entry.note = trimmed;
    else delete entry.note;
    s.visited[id] = entry;
    this.persist(s);
  }

  hasClue(letter: string): boolean {
    const s = this.subject.value;
    return !!(s && s.clues[this.normaliseClue(letter)]);
  }

  addClue(letter: string, where?: string): void {
    const s = this.subject.value;
    if (!s) return;
    const key = this.normaliseClue(letter);
    if (!key || s.clues[key]) return;
    s.clues[key] = { at: new Date().toISOString(), where };
    this.persist(s);
  }

  removeClue(letter: string): void {
    const s = this.subject.value;
    if (!s) return;
    const key = this.normaliseClue(letter);
    if (!s.clues[key]) return;
    delete s.clues[key];
    this.persist(s);
  }

  getAnswer(qid: string): AnswerEntry | undefined {
    return this.subject.value?.answers[qid];
  }

  setAnswer(qid: string, correct: boolean): void {
    const s = this.subject.value;
    if (!s) return;
    s.answers[qid] = { correct, at: new Date().toISOString() };
    this.persist(s);
  }

  clearAnswer(qid: string): void {
    const s = this.subject.value;
    if (!s?.answers[qid]) return;
    delete s.answers[qid];
    this.persist(s);
  }

  exportJson(): string {
    return JSON.stringify(this.subject.value ?? null, null, 2);
  }

  importJson(raw: string): void {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Il file non contiene una sessione valida.');
    }
    if (typeof parsed.startedAt !== 'string' || typeof parsed.visited !== 'object') {
      throw new Error('Formato sessione non riconosciuto.');
    }
    const session: Session = {
      startedAt: parsed.startedAt,
      visited: parsed.visited ?? {},
      clues: parsed.clues ?? {},
      answers: parsed.answers ?? {},
    };
    this.persist(session);
  }

  private normaliseClue(letter: string): string {
    return (letter ?? '').trim().toUpperCase().slice(0, 4);
  }

  private persist(s: Session): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
    this.subject.next({
      startedAt: s.startedAt,
      visited: { ...s.visited },
      clues: { ...s.clues },
      answers: { ...s.answers },
    });
  }

  private load(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        startedAt: parsed.startedAt,
        visited: parsed.visited ?? {},
        clues: parsed.clues ?? {},
        answers: parsed.answers ?? {},
      };
    } catch {
      return null;
    }
  }
}
