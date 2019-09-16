import { Component, OnInit } from '@angular/core';
import { SharedState } from 'src/app/state/shared.state';

@Component({
  selector: 'app-player-stats',
  templateUrl: 'player-stats.page.html',
  styleUrls: ['player-stats.page.scss']
})
export class PlayerStatsPage {
  constructor(
    public state: SharedState
  ) { }
}


