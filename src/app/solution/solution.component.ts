import { Component } from '@angular/core';
import { AdventureService } from '../adventure.service';

@Component({
  selector: 'app-solution',
  standalone: false,
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent {
  constructor(public adventure: AdventureService) {}

  get solution() {
    return this.adventure.getSolution();
  }
}
