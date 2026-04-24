import { Injectable } from '@angular/core';

export interface MapPoint {
  id: string;
  name: string | null;
  coordinates: [number, number];
  properties: any;
}

@Injectable({ providedIn: 'root' })
export class MapService {
  map: any = null;
  points: MapPoint[] = [];
  openHint?: (properties: any) => void;

  flyToAndOpen(p: MapPoint): void {
    if (this.map) {
      this.map.flyTo([p.coordinates[1], p.coordinates[0]], 17);
    }
    if (this.openHint) this.openHint(p.properties);
  }
}
