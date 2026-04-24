import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MapService, MapPoint } from '../map.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  filter = '';
  onlyVisited = false;

  constructor(
    public map: MapService,
    public session: SessionService,
    public dialogRef: MatDialogRef<SearchComponent>,
  ) {}

  results(): MapPoint[] {
    const f = this.filter.trim().toLowerCase();
    return this.map.points.filter(p => {
      if (this.onlyVisited && !this.session.isVisited(p.id)) return false;
      if (!f) return true;
      return (p.name ?? '').toLowerCase().includes(f) || p.id.toLowerCase().includes(f);
    });
  }

  select(p: MapPoint): void {
    this.dialogRef.close();
    this.map.flyToAndOpen(p);
  }
}
