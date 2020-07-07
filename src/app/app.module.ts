import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

import { ImageDialogComponent } from './image-dialog/image-dialog.component';
import { GameInfoComponent } from './game-info/game-info.component';
import { BdgComponent } from './bdg/bdg.component';
import { HttpClientModule } from '@angular/common/http';
import { BdgMapComponent } from './bdg-map/bdg-map.component';
import { HintComponent } from './hint/hint.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdventuresComponent } from './adventures/adventures.component';
import { SolutionComponent } from './solution/solution.component';
import { MatListModule } from '@angular/material/list';
import { IntroComponent } from './intro/intro.component';

@NgModule({
  declarations: [
    AppComponent,
    ImageDialogComponent,
    GameInfoComponent,
    BdgComponent,
    BdgMapComponent,
    HintComponent,
    AdventuresComponent,
    SolutionComponent,
    IntroComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatDialogModule,
    MatTabsModule,
    MatExpansionModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
