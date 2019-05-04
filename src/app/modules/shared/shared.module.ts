import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchComponent } from './components/match/match.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { TableManageComponent } from './components/table-manage/table-manage.component';
import { TableSearchPipe } from './pipes/table-search.pipe';
import { AppSelectAllDirective } from 'src/app/directives/app-select-all.directive';
import { AppAutoClearDirective } from 'src/app/directives/app-auto-clear.directive';
import { PlayerSearchPipe } from './pipes/player-search.pipe';
import { StatsComponent } from './components/stats/stats.component';

@NgModule({
  declarations: [
    MatchComponent,
    HeaderComponent,
    TableManageComponent,
    TableSearchPipe,
    PlayerSearchPipe,
    AppSelectAllDirective,
    AppAutoClearDirective,
    StatsComponent
  ],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
  exports: [
    MatchComponent,
    HeaderComponent,
    TableManageComponent,
    TableSearchPipe,
    PlayerSearchPipe,
    StatsComponent
  ],
  entryComponents: [TableManageComponent, StatsComponent]
})
export class SharedModule { }
