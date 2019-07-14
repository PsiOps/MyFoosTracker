import { Component } from '@angular/core';
import { AuthenticationService } from '../../auth/authentication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-player-stats',
  templateUrl: 'player-stats.page.html',
  styleUrls: ['player-stats.page.scss']
})
export class PlayerStatsPage {
  public player$: Observable<{id: string, nickname: string, photoUrl: string}>;
  constructor(public authService: AuthenticationService) {
    this.player$ = this.authService.playerDoc.valueChanges()
      .pipe(map(player => {
        return { id: this.authService.user.uid, nickname: player.nickname, photoUrl: player.photoUrl };
      }));
  }
}


