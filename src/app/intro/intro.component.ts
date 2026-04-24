import { Component } from '@angular/core';
import { AdventureService } from '../adventure.service';

@Component({
  selector: 'app-intro',
  standalone: false,
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent {
  constructor(public adventure: AdventureService) {}

  get intro() {
    return this.adventure.getIntro();
  }
}
