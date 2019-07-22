import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MatchService } from '../../services/match.service';
import { Team, Player, Match, TeamComboStats } from '../../domain';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { NotificationService } from '../../services/notification.service';
import { Observable, of } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  public matchesOnWatchedTables$: Observable<Match[]>;
  public teamComboStats$: Observable<TeamComboStats> = of(new TeamComboStats());

  constructor(
    public playerService: PlayerService,
    private matchService: MatchService,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController,
    private notificationService: NotificationService) {
    this.matchesOnWatchedTables$ = this.matchService.getMatchesOnWatchedTables();
  }

  public async createMatch(player: Player) {
    this.matchService.createMatch(player);
  }

  public async addPlayers() {
    const modal = await this.modalController.create({
      component: PlayerSelectComponent
    });
    modal.onDidDismiss().then(async () => {
      await this.notificationService.sendInvites();
    });
    return await modal.present();
  }

  public async startMatch() {
    await this.matchService.startMatch();
  }

  public async cancelNotStartedMatch() {
    await this.matchService.cancelMatch();
  }

  public async cancelStartedMatch() {
    const alert = await this.alertController.create({
      header: 'Confirm Match Cancellation',
      message: 'Do you really want to stop the current match? The match information will be lost!',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'YES, STOP MATCH',
          handler: async () => {
            await this.matchService.cancelMatch();
          }
        }
      ]
    });

    await alert.present();
  }

  public async finishMatch() {
    await this.matchService.finishMatch();
  }

  public refresh($event: any) {
    setTimeout(() => $event.target.complete(), 500);
  }

  public async onScored($event: { goalsTeamA: number, goalsTeamB: number }) {
    await this.matchService.saveScoreAndUpdateStats($event);
  }

  public async onScoringCancelled() {
    await this.matchService.reopenMatch();
  }

  public async onMatchJoined($event: Team) {
    await this.matchService.addPlayerToTeam(this.playerService.playerDocRef, $event);
  }

  public async leaveTeam() {
    await this.matchService.leaveMatch(this.playerService.playerDocRef);
  }

  public async leaveMatch() {
    await this.matchService.leaveMatch(this.playerService.playerDocRef);
  }

  public async dismissMatch() {
    await this.matchService.dismissMatch();
  }
}
