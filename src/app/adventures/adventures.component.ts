import { AdventureService } from './../adventure.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-adventures',
  templateUrl: './adventures.component.html',
  styleUrls: ['./adventures.component.scss']
})
export class AdventuresComponent implements OnInit {

  adventures;

  constructor(
    private adv: AdventureService
  ) { }

  ngOnInit(): void {
    this.adv.getAdventures().subscribe(data => {
      this.adventures = data;
    });
  }

  startAdventure(i){}
}
