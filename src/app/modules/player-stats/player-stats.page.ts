import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { SharedState } from 'src/app/state/shared.state';

@Component({
  selector: 'app-player-stats',
  templateUrl: 'player-stats.page.html',
  styleUrls: ['player-stats.page.scss']
})
export class PlayerStatsPage implements OnInit {
  private loadingIndicator: HTMLIonLoadingElement;

  constructor(
    public state: SharedState,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    this.loadingIndicator = await this.loadingController.create({
      spinner: 'dots',
      message: 'Loading...'
    });

    await this.loadingIndicator.present();
  }

  onStatsLoaded() {
    setTimeout(async () => {
      console.log('dismissing loader');
      await this.loadingController.dismiss();
    }, 500);
  }
}


