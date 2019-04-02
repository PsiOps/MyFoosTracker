import { Component } from '@angular/core';
import { AuthenticationService } from '../../auth/authentication.service';
import { Team, Player } from '../../domain';
import { ToastController } from '@ionic/angular';
import { MatchService } from '../../services/match.service';
import { ModalController } from '@ionic/angular';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public isInEditMode = false;
  public gamePin?: number = null;

  constructor(
    public authService: AuthenticationService,
    private matchService: MatchService,
    private toastController: ToastController,
    private modalController: ModalController,
    private notificationService: NotificationService) {
    this.matchService.findCurrentMatch();
    this.matchService.findMatchesOnWatchedTables();
  }
  public async createMatch(player: Player) {
    this.matchService.createMatch(player);
  }

  public async addPlayers() {
    const modal = await this.modalController.create({
      component: PlayerSelectComponent
    });
    modal.onDidDismiss().then(async () => {
      console.log('Sending invites');
      await this.notificationService.sendInvites();
    });
    return await modal.present();
  }

  public async startMatch() {
    await this.matchService.startMatch();
  }

  public async cancelMatch() {
    await this.matchService.cancelMatch();
  }

  public async finishMatch() {
    await this.matchService.finishMatch();
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

  public startEditMode(): void {
    this.isInEditMode = true;
  }

  public async findMatchToJoin() {
    if (!this.gamePin) { return; }
    await this.matchService.findMatchToJoin(this.gamePin, async () => {
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
  public submitNickname(nickname: string): void {
    this.isInEditMode = false;
    this.authService.setNickname(nickname);
  }
}
