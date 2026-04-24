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
import { SearchComponent } from './search/search.component';
import { TaccuinoComponent } from './taccuino/taccuino.component';
import { SessionService } from './session.service';
import { MapService, MapPoint } from './map.service';

declare const L;

interface PageSection {
  title: string;
  open: boolean;
  pages: string[];
}

interface AssetManifest {
  times: PageSection[];
  annuario: PageSection[];
}

const VISITED_STYLE = {
  radius: 30,
  fillColor: '#a19476',
  color: '#48330b',
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.45,
};

const UNVISITED_STYLE = {
  radius: 30,
  fillColor: '#ff7800',
  color: '#000',
  weight: 1,
  opacity: 0.3,
  fillOpacity: 0,
};

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'justplay-shic';

  mymap;

  times: PageSection[] = [];

  annuario: PageSection[] = [];

  interactions;
  points;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    public adv: AdventureService,
    public session: SessionService,
    private mapService: MapService,
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
            this.dialog.open(BdgComponent, { data: f.properties });
          }
        })
      }
    }).addTo(this.mymap);

    this.points = L.geoJSON([], {
      pointToLayer: (feature, latlng) => {
        const visited = this.session.isVisited(feature.properties.id);
        return L.circle(latlng, visited ? VISITED_STYLE : UNVISITED_STYLE);
      },
      onEachFeature: (f, l) => {
        l.on({
          click: () => this.openHint(f.properties)
        });
      }
    }).addTo(this.mymap);

    this.http.get('/assets/ddt/interactions.geojson').subscribe((data: any) => {
      this.interactions.addData(data.features);
    });
    this.http.get('/assets/ddt/points.geojson').subscribe((data: any) => {
      this.points.addData(data.features);
      this.mapService.points = (data.features as any[]).map(f => ({
        id: f.properties.id,
        name: f.properties.name,
        coordinates: f.geometry.coordinates,
        properties: f.properties,
      }) as MapPoint);
    });

    this.http.get<AssetManifest>('/assets/ddt/manifest.json').subscribe(manifest => {
      this.times = manifest.times;
      this.annuario = manifest.annuario;
    });

    this.mapService.map = this.mymap;
    this.mapService.openHint = (props) => this.openHint(props);

    this.session.session$.subscribe(() => this.restylePoints());
  }

  private restylePoints(): void {
    if (!this.points) return;
    this.points.eachLayer((layer: any) => {
      const feature = layer.feature;
      if (!feature) return;
      const visited = this.session.isVisited(feature.properties.id);
      layer.setStyle(visited ? VISITED_STYLE : UNVISITED_STYLE);
    });
  }

  private openHint(properties: any): void {
    this.dialog.open(HintComponent, { data: properties });
  }

  show(title, url, width) {
    this.dialog.open(ImageDialogComponent, { data: { title, url, width } });
  }

  gameInfo() {
    this.dialog.open(GameInfoComponent);
  }

  chooseAdventure() {
    this.dialog.open(AdventuresComponent);
  }

  showIntro() {
    this.dialog.open(IntroComponent);
  }

  solveAdventure() {
    this.dialog.open(SolutionComponent);
  }

  loadAdventureFromFile(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        this.adv.loadAdventure(parsed);
        this.showIntro();
      } catch (err: any) {
        alert('Caricamento avventura fallito: ' + (err?.message ?? 'file non valido.'));
      }
    };
    reader.readAsText(file);
  }

  unloadAdventure(): void {
    if (confirm('Scaricare l\'avventura corrente?')) {
      this.adv.unloadAdventure();
    }
  }

  newSession() {
    if (this.session.isActive() &&
        !confirm('Iniziare una nuova partita cancellerà i luoghi visitati e gli appunti. Continuare?')) {
      return;
    }
    this.session.startNew();
  }

  endSession() {
    if (confirm('Chiudere la partita corrente e rimuovere tutti gli appunti?')) {
      this.session.clear();
    }
  }

  openSearch() {
    this.dialog.open(SearchComponent);
  }

  openTaccuino() {
    this.dialog.open(TaccuinoComponent);
  }
}
