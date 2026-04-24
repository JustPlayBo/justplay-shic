import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

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
import { SearchComponent } from './search/search.component';
import { TaccuinoComponent } from './taccuino/taccuino.component';
import { QuestionsComponent } from './questions/questions.component';
import { SherlockPathComponent } from './sherlock-path/sherlock-path.component';
import { CreateAdventureComponent } from './create-adventure/create-adventure.component';

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
    IntroComponent,
    SearchComponent,
    TaccuinoComponent,
    QuestionsComponent,
    SherlockPathComponent,
    CreateAdventureComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSidenavModule,
    MatDialogModule,
    MatTabsModule,
    MatExpansionModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
