import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdventureService, PathStep } from '../adventure.service';
import { MapService, MapPoint } from '../map.service';

@Component({
  selector: 'app-sherlock-path',
  standalone: false,
  templateUrl: './sherlock-path.component.html',
  styleUrls: ['./sherlock-path.component.scss'],
})
export class SherlockPathComponent {
  constructor(
    public adventure: AdventureService,
    public mapService: MapService,
    public dialogRef: MatDialogRef<SherlockPathComponent>,
  ) {}

  get path() {
    return this.adventure.getSherlockPath();
  }

  pointFor(step: PathStep): MapPoint | undefined {
    if (!step.at) return undefined;
    return this.mapService.points.find(p => p.id === step.at);
  }

  goTo(step: PathStep): void {
    const p = this.pointFor(step);
    if (!p) return;
    this.dialogRef.close();
    this.mapService.flyToAndOpen(p);
  }
}
