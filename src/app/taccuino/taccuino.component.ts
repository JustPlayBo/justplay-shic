import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionService, VisitedEntry, ClueEntry } from '../session.service';
import { MapService, MapPoint } from '../map.service';

interface VisitedRow {
  id: string;
  name: string | null;
  at: string;
  note?: string;
  point?: MapPoint;
}

interface ClueRow {
  letter: string;
  at: string;
  where?: string;
  whereName?: string | null;
}

@Component({
  selector: 'app-taccuino',
  standalone: false,
  templateUrl: './taccuino.component.html',
  styleUrls: ['./taccuino.component.scss'],
})
export class TaccuinoComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public session: SessionService,
    public mapService: MapService,
    public dialogRef: MatDialogRef<TaccuinoComponent>,
  ) {}

  visitedRows(): VisitedRow[] {
    const s = this.session.current;
    if (!s) return [];
    const byId = new Map(this.mapService.points.map(p => [p.id, p] as const));
    return Object.entries(s.visited)
      .map(([id, entry]: [string, VisitedEntry]) => {
        const point = byId.get(id);
        return {
          id,
          name: point?.name ?? null,
          at: entry.at,
          note: entry.note,
          point,
        };
      })
      .sort((a, b) => a.at.localeCompare(b.at));
  }

  clueRows(): ClueRow[] {
    const s = this.session.current;
    if (!s) return [];
    const byId = new Map(this.mapService.points.map(p => [p.id, p] as const));
    return Object.entries(s.clues)
      .map(([letter, entry]: [string, ClueEntry]) => ({
        letter,
        at: entry.at,
        where: entry.where,
        whereName: entry.where ? (byId.get(entry.where)?.name ?? null) : null,
      }))
      .sort((a, b) => a.letter.localeCompare(b.letter));
  }

  goTo(row: VisitedRow): void {
    if (!row.point) return;
    this.dialogRef.close();
    this.mapService.flyToAndOpen(row.point);
  }

  export(): void {
    const data = this.session.exportJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `shic-session-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (this.session.isActive() &&
        !confirm('Importare sovrascriverà la partita corrente. Continuare?')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        this.session.importJson(reader.result as string);
      } catch (err: any) {
        alert('Importazione fallita: ' + (err?.message ?? 'file non valido.'));
      }
    };
    reader.readAsText(file);
  }
}
