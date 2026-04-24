import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'shic.session';

export interface VisitedEntry {
  at: string;
  note?: string;
}

export interface Session {
  startedAt: string;
  visited: Record<string, VisitedEntry>;
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
    this.persist({ startedAt: new Date().toISOString(), visited: {} });
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

  private persist(s: Session): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
    this.subject.next({ startedAt: s.startedAt, visited: { ...s.visited } });
  }

  private load(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
