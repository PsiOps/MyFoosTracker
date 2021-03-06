import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { SharedModule } from '../shared/shared.module';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { TableSelectComponent } from './components/table-select/table-select.component';
import { TableSelectDialogComponent } from './components/table-select/table-select-dialog/table-select-dialog.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: HomePage }]),
    SharedModule
  ],
  declarations: [
    HomePage,
    PlayerSelectComponent,
    TableSelectComponent,
    TableSelectDialogComponent],
  entryComponents: [PlayerSelectComponent, TableSelectDialogComponent]
})
export class HomePageModule {}
