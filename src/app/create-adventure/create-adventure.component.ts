import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdventureService, Adventure, ConditionalHint, Question, PathStep } from '../adventure.service';
import { MapService, MapPoint } from '../map.service';

interface PlaceDraft {
  id: string;
  default: string;
  conditional: ConditionalHint[];
}

interface QuestionSetDraft {
  title: string;
  items: Question[];
}

interface AdventureDraft {
  id: string;
  title: string;
  version: number;
  intro: { title: string; html: string };
  solution: { title: string; html: string };
  places: PlaceDraft[];
  questions: { primary: QuestionSetDraft; secondary: QuestionSetDraft };
  sherlockPath: { title: string; steps: PathStep[] };
}

function blankDraft(): AdventureDraft {
  return {
    id: '',
    title: '',
    version: 1,
    intro: { title: '', html: '' },
    solution: { title: '', html: '' },
    places: [],
    questions: {
      primary: { title: 'Domande principali', items: [] },
      secondary: { title: 'Domande accessorie', items: [] },
    },
    sherlockPath: { title: 'Percorso di Sherlock Holmes', steps: [] },
  };
}

@Component({
  selector: 'app-create-adventure',
  standalone: false,
  templateUrl: './create-adventure.component.html',
  styleUrls: ['./create-adventure.component.scss'],
})
export class CreateAdventureComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  draft: AdventureDraft = blankDraft();
  addPointId = '';

  constructor(
    public mapService: MapService,
    public adventure: AdventureService,
    public dialogRef: MatDialogRef<CreateAdventureComponent>,
  ) {}

  get availablePoints(): MapPoint[] {
    const used = new Set(this.draft.places.map(p => p.id));
    return this.mapService.points.filter(p => !used.has(p.id));
  }

  placeLabel(id: string): string {
    const p = this.mapService.points.find(x => x.id === id);
    return p?.name ? `${id} — ${p.name}` : id;
  }

  addPlace(): void {
    const id = this.addPointId;
    if (!id || this.draft.places.some(p => p.id === id)) return;
    this.draft.places.push({ id, default: '', conditional: [] });
    this.addPointId = '';
  }

  removePlace(i: number): void {
    this.draft.places.splice(i, 1);
  }

  addConditional(place: PlaceDraft): void {
    place.conditional.push({ requires: [], html: '' });
  }

  removeConditional(place: PlaceDraft, i: number): void {
    place.conditional.splice(i, 1);
  }

  addRequires(cond: ConditionalHint, letter: string): void {
    const norm = (letter ?? '').trim().toUpperCase();
    if (!norm || cond.requires.includes(norm)) return;
    cond.requires.push(norm);
    cond.requires.sort();
  }

  removeRequires(cond: ConditionalHint, letter: string): void {
    const i = cond.requires.indexOf(letter);
    if (i >= 0) cond.requires.splice(i, 1);
  }

  addQuestion(set: QuestionSetDraft, prefix: string): void {
    const nextId = `${prefix}${set.items.length + 1}`;
    set.items.push({ id: nextId, text: '', answer: '', points: 5 });
  }

  removeQuestion(set: QuestionSetDraft, i: number): void {
    set.items.splice(i, 1);
  }

  addStep(): void {
    this.draft.sherlockPath.steps.push({ title: '', gains: [] });
  }

  removeStep(i: number): void {
    this.draft.sherlockPath.steps.splice(i, 1);
  }

  addStepGain(step: PathStep, letter: string): void {
    const norm = (letter ?? '').trim().toUpperCase();
    if (!norm) return;
    if (!step.gains) step.gains = [];
    if (step.gains.includes(norm)) return;
    step.gains.push(norm);
    step.gains.sort();
  }

  removeStepGain(step: PathStep, letter: string): void {
    if (!step.gains) return;
    const i = step.gains.indexOf(letter);
    if (i >= 0) step.gains.splice(i, 1);
  }

  build(): Adventure {
    const adv: Adventure = {
      id: this.draft.id || undefined,
      title: this.draft.title || undefined,
      version: this.draft.version || 1,
      places: {},
    };

    if (this.draft.intro.html.trim() || this.draft.intro.title.trim()) {
      adv.intro = {
        title: this.draft.intro.title.trim() || undefined,
        html: this.draft.intro.html,
      };
    }
    if (this.draft.solution.html.trim() || this.draft.solution.title.trim()) {
      adv.solution = {
        title: this.draft.solution.title.trim() || undefined,
        html: this.draft.solution.html,
      };
    }

    for (const place of this.draft.places) {
      const conditional = place.conditional
        .filter(c => c.requires.length > 0 && c.html.trim())
        .map(c => ({ requires: [...c.requires], html: c.html }));
      if (place.default.trim() && conditional.length === 0) {
        adv.places[place.id] = place.default;
      } else {
        const entry: any = {};
        if (place.default.trim()) entry.default = place.default;
        if (conditional.length > 0) entry.conditional = conditional;
        if (Object.keys(entry).length > 0) adv.places[place.id] = entry;
      }
    }

    const pruneSet = (s: QuestionSetDraft) => {
      const items = s.items.filter(q => q.text.trim() && q.answer.trim());
      return items.length ? { title: s.title, items } : undefined;
    };
    const primary = pruneSet(this.draft.questions.primary);
    const secondary = pruneSet(this.draft.questions.secondary);
    if (primary || secondary) {
      adv.questions = {};
      if (primary) adv.questions.primary = primary;
      if (secondary) adv.questions.secondary = secondary;
    }

    const steps = this.draft.sherlockPath.steps
      .filter(s => s.title.trim())
      .map(s => {
        const step: PathStep = { title: s.title.trim() };
        if (s.at) step.at = s.at;
        if (s.description?.trim()) step.description = s.description.trim();
        if (s.gains?.length) step.gains = [...s.gains];
        return step;
      });
    if (steps.length) {
      adv.sherlockPath = { title: this.draft.sherlockPath.title, steps };
    }

    return adv;
  }

  toJson(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  download(): void {
    const blob = new Blob([this.toJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (this.draft.id || 'adventure').replace(/[^a-z0-9-]/gi, '_');
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  apply(): void {
    try {
      this.adventure.loadAdventure(this.build());
      this.dialogRef.close();
    } catch (err: any) {
      alert('Impossibile applicare l\'avventura: ' + (err?.message ?? 'formato non valido.'));
    }
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Adventure;
        this.loadIntoDraft(parsed);
      } catch (err: any) {
        alert('Caricamento fallito: ' + (err?.message ?? 'file non valido.'));
      }
    };
    reader.readAsText(file);
  }

  loadCurrent(): void {
    if (!this.adventure.adventure) return;
    this.loadIntoDraft(this.adventure.adventure);
  }

  private loadIntoDraft(adv: Adventure): void {
    const d = blankDraft();
    d.id = adv.id ?? '';
    d.title = adv.title ?? '';
    d.version = adv.version ?? 1;
    const intro: any = adv.intro;
    if (intro) {
      const i = typeof intro === 'string' ? { html: intro } : intro;
      d.intro = { title: i.title ?? '', html: i.html ?? '' };
    }
    const sol: any = adv.solution;
    if (sol) {
      const s = typeof sol === 'string' ? { html: sol } : sol;
      d.solution = { title: s.title ?? '', html: s.html ?? '' };
    }

    for (const [id, entry] of Object.entries(adv.places ?? {})) {
      if (typeof entry === 'string') {
        d.places.push({ id, default: entry, conditional: [] });
      } else {
        d.places.push({
          id,
          default: entry.default ?? '',
          conditional: (entry.conditional ?? []).map(c => ({
            requires: [...(c.requires ?? [])],
            html: c.html,
          })),
        });
      }
    }

    if (adv.questions?.primary) {
      d.questions.primary = {
        title: adv.questions.primary.title,
        items: adv.questions.primary.items.map(q => ({ ...q })),
      };
    }
    if (adv.questions?.secondary) {
      d.questions.secondary = {
        title: adv.questions.secondary.title,
        items: adv.questions.secondary.items.map(q => ({ ...q })),
      };
    }
    if (adv.sherlockPath) {
      d.sherlockPath = {
        title: adv.sherlockPath.title ?? d.sherlockPath.title,
        steps: adv.sherlockPath.steps.map(s => ({ ...s, gains: s.gains ? [...s.gains] : [] })),
      };
    }

    this.draft = d;
  }
}
