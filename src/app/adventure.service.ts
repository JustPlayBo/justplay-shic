import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AdventureService {

  adventure;
  selected = false;

  constructor(
    private http: HttpClient
  ) { }

  getAdventures() {
    try {
      return this.http.get('https://adventures.sherlock.justplaybo.it/adventures')
        .pipe(
          catchError((err: HttpErrorResponse) => of([]))
        );
    } catch (ex) {
      return of([]);
    }
  }

  getAdventure(id) {
    this.http.get(`https://adventures.sherlock.justplaybo.it/adventures/${id}`).subscribe(
      data => {
        this.adventure = data;
        this.selected = true;
      }
    );
  }

  get adventureSelected() {
    return this.selected;
  }

  getHint(place) {
    try {
      if ( this.adventure && Object.keys(this.adventure.places).indexOf(place) >= 0) {
        return this.adventure.places[place];
      }
    } catch (ex) { }
    return 'Non ci sono indizi in questo punto della mappa.';
  }

  solveAdventure() {
    try {
      if (this.adventure) {
        return this.adventure.solution;
      }
    } catch (ex) { }
  }

  beginAdventure() {
    try {
      if (this.adventure) {
        return this.adventure.solution;
      }
    } catch (ex) { }
  }
}
