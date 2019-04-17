import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MatchService } from '../../services/match.service';
import { AuthenticationService } from '../../auth/authentication.service';
import { Team, Player, Match } from '../../domain';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public player$: Observable<Player>;
  public matchesOnWatchedTables$: Observable<Match[]>;
  constructor(
    public authService: AuthenticationService,
    private matchService: MatchService,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController,
    private notificationService: NotificationService) {
    this.player$ = this.authService.playerDoc.valueChanges();
    this.matchService.findCurrentMatch();
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
    this.matchService.findCurrentMatch();

    setTimeout(() => $event.target.complete(), 500);
  }

  public async onScored($event: { goalsTeamA: number, goalsTeamB: number }) {
    await this.matchService.saveScoreAndUpdateStats($event);
  }

  public async onScoringCancelled() {
    await this.matchService.reopenMatch();
  }

  public async onMatchJoined($event: Team) {
    await this.matchService.addPlayerToTeam(this.authService.playerDoc.ref, $event);
  }

  public async leaveTeam() {
    await this.matchService.leaveMatch(this.authService.playerDoc.ref);
  }

  public async leaveMatch() {
    await this.matchService.leaveMatch(this.authService.playerDoc.ref);
  }

  public async dismissMatch() {
    await this.matchService.dismissMatch();
  }

  public async findMatchToJoin() {
    const alert = await this.alertController.create({
      header: 'Join Match',
      message: 'Enter the game PIN of the match you want to join',
      inputs: [
        {
          name: 'gamePin',
          placeholder: 'Enter Game PIN',
          type: 'number',
          min: 1,
          max: 9999
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'Join Match',
          handler: async (data) => {
            await this.joinMatch(data.gamePin);
          }
        }
      ]
    });

    await alert.present();
  }

  private async joinMatch(gamePin: number) {
    await this.matchService.findMatchToJoin(gamePin, async () => {
      const toast = await this.toastController.create({
        message: 'No open matches found with that PIN.',
        duration: 2000,
        color: 'warning',
        animated: true,
        translucent: true
      });
      toast.present();
    });
  }
}
