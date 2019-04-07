import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { SharedModule } from '../shared/shared.module';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { SearchPipe } from './components/player-select/search/search.pipe';
import { TableSelectComponent } from './components/table-select/table-select.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
    SharedModule
  ],
  declarations: [
    Tab1Page,
    PlayerSelectComponent,
    SearchPipe,
    TableSelectComponent],
  entryComponents: [PlayerSelectComponent, TableSelectComponent]
})
export class Tab1PageModule {}
