import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../auth/authentication.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-player-stats',
  templateUrl: 'player-stats.page.html',
  styleUrls: ['player-stats.page.scss']
})
export class PlayerStatsPage implements OnInit {
  private loadingIndicator: HTMLIonLoadingElement;

  public player$: Observable<{ id: string, nickname: string, photoUrl: string }>;

  constructor(
    public authService: AuthenticationService,
    private loadingController: LoadingController
  ) {
    this.player$ = this.authService.playerDoc.valueChanges()
      .pipe(
        map(player => {
        return {
          id: this.authService.user.uid,
          nickname: player.nickname,
          photoUrl: player.photoUrl
        };
      }));
  }

  async ngOnInit() {
    this.loadingIndicator = await this.loadingController.create({
      spinner: 'dots',
      message: 'Loading...'
    });

    await this.loadingIndicator.present();
  }

  onStatsLoaded() {
    setTimeout(async () => {
      await this.loadingController.dismiss();
    }, 500);
  }
}


