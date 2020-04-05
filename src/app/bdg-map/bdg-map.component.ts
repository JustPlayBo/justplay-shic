import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

declare const L;

@Component({
  selector: 'bdg-map',
  templateUrl: './bdg-map.component.html',
  styleUrls: ['./bdg-map.component.scss']
})
export class BdgMapComponent implements OnInit, AfterViewInit {

  @Input() bdg;
  @Input() fmt;
  @Input() public floor;

  map;

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {

    this.map = L.map(this.floor.id + '_bdg_map', {
      crs: L.CRS.Simple,
      minZoom: -3
    });
    const bounds = [[0, 0], [this.floor.size.height / 2, this.floor.size.width / 2]];
    const img = '/assets/ddt/bdgs/' + this.bdg + '/' + this.floor.id + '.' + this.fmt;
    console.log(img);
    const image = L.imageOverlay(img, bounds).addTo(this.map);
    this.map.fitBounds(bounds);
  }

}
