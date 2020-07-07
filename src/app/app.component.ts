import { IntroComponent } from './intro/intro.component';
import { SolutionComponent } from './solution/solution.component';
import { AdventureService } from './adventure.service';
import { BdgComponent } from './bdg/bdg.component';
import { GameInfoComponent } from './game-info/game-info.component';
import { ImageDialogComponent } from './image-dialog/image-dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { HintComponent } from './hint/hint.component';
import { AdventuresComponent } from './adventures/adventures.component';

declare const L;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'justplay-shic';

  mymap;

  times = [];

  annuario = [];

  interactions;
  points;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    public adv: AdventureService
  ) {
    
  }

  ngOnInit() {
    this.mymap = L.map('map').setView([51.50900640598445, -0.11960303487590755], 14.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'your.mapbox.access.token'
    }).addTo(this.mymap);
    L.tileLayer('/assets/ddt/map/{z}/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 17,
      tms: false,
      attribution: 'Map of London, Copyright Asmodee'
    }).addTo(this.mymap);
    L.tileLayer('/assets/ddt/qp/{z}/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 18,
      tms: false,
      attribution: 'Map of Queen\'s Park, Copyright Asmodee'
    }).addTo(this.mymap);
    L.tileLayer('/assets/ddt/bo/{z}/{x}/{y}.png', {
      minZoom: 12,
      maxZoom: 19,
      tms: false,
      attribution: 'Map of Bologna, Copyright Archivio Digitale Comune di Bologna'
    }).addTo(this.mymap);
    this.interactions = L.geoJSON([], {
      onEachFeature: (f, l) => {
        l.on({
          click: (e) => {
            console.log(f);
            this.dialog.open(BdgComponent, { data: f.properties });
          }
        })
      }
    }).addTo(this.mymap);
    const geojsonMarkerOptions = {
      radius: 30,
      fillColor: "#ff7800",
      color: "#000",
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0
    };

    this.points = L.geoJSON([], {
      pointToLayer: (feature, latlng) => {
        return L.circle(latlng, geojsonMarkerOptions);
      },
      onEachFeature: (f, l) => {
        l.on({
          click: (e) => {
            console.log(f);
            this.dialog.open(HintComponent, { data: f.properties });
          }
        })
      }
    }).addTo(this.mymap);
    this.http.get('/assets/ddt/interactions.geojson').subscribe((data: any) => {
      this.interactions.addData(data.features);
    });
    this.http.get('/assets/ddt/points.geojson').subscribe((data: any) => {
      this.points.addData(data.features);
    });


    this.annuario.push({ title: 'Delitti del Tamigi', pages: [], open: true});
    for (let i = 1; i < 22; i++) {
      this.annuario[0].pages.push({ type: 'img', url: '/assets/ddt/annuario/ddt/Annuario-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }
    this.annuario.push({ title: 'Carlton House e Queen\'s Park', pages: [], open: false});
    for (let i = 1; i < 22; i++) {
      this.annuario[1].pages.push({ type: 'img', url: '/assets/ddt/annuario/chqp/Annuario-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }

    this.times.push({ title: 'Delitti del Tamigi', pages: [], open: true });
    for (let i = 1; i < 21; i++) {
      this.times[0].pages.push({ type: 'img', url: '/assets/ddt/times/ddt/Times-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }

    this.times.push({ title: 'Carlton House e Queen\'s Park', pages: [], open: false });
    for (let i = 1; i < 11; i++) {
      this.times[1].pages.push({ type: 'img', url: '/assets/ddt/times/chqp/Times-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }

    this.times.push({ title: 'Delitti del Tamigi - Vecchia Edizione', pages: [], open: false });
    for (let i = 1; i < 21; i++) {
      this.times[2].pages.push({ type: 'img', url: '/assets/ddt/times/ddt-old/Times-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }

    this.times.push({ title: 'Casi Aggiuntivi - Scrittore Senza Nome', pages: [], open: false });
    for (let i = 2; i < 4; i++) {
      this.times[3].pages.push({ type: 'img', url: '/assets/ddt/times/ssn/Times-page-' + i.toString().padStart(3, '0') + '.jpg' })
    }

  }

  show(title, url, width)  { 
    this.dialog.open(ImageDialogComponent, {data: {title, url, width}});
  }

  gameInfo() {
    this.dialog.open(GameInfoComponent);
  }

  chooseAdventure() {
    this.dialog.open(AdventuresComponent);
  }

  solveAdventure() {
    this.dialog.open(IntroComponent);
  }
  solveAdventure() {
    this.dialog.open(SolutionComponent);
  }

}
