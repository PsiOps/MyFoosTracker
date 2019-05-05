import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlayersPage } from './players.page';
import { SharedModule } from '../shared/shared.module';
import { PlayerManageComponent } from './components/player-manage/player-manage.component';

const routes: Routes = [
  {
    path: '',
    component: PlayersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [PlayersPage, PlayerManageComponent]
})
export class PlayersPageModule {}
