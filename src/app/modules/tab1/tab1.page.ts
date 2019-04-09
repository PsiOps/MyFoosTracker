import { Component } from '@angular/core';
import { ToastController, PopoverController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { MatchService } from '../../services/match.service';
import { AuthenticationService } from '../../auth/authentication.service';
import { Team, Player } from '../../domain';
import { PlayerSelectComponent } from './components/player-select/player-select.component';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs';
import { TableService } from 'src/app/services/table.service';
import { TableSelectComponent } from './components/table-select/table-select.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public isInEditMode = false;
  public gamePin?: number = null;
  public player$: Observable<Player>;

  constructor(
    public authService: AuthenticationService,
    private matchService: MatchService,
    private tableService: TableService,
    private toastController: ToastController,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private notificationService: NotificationService) {
    this.player$ = this.authService.playerDoc.valueChanges();
    this.matchService.findCurrentMatch();
    this.matchService.findMatchesOnWatchedTables();
  }
  public async createMatch(player: Player) {
    this.tableService.setCurrentTable(player.defaultTableId);
    this.matchService.createMatch(player);
  }

  public async pickTable() {
    const popover = await this.popoverController.create({
      component: TableSelectComponent,
      translucent: true
    });
    popover.onWillDismiss().then(id => {
      // this.tableService.setCurrentTable(id.data);
      // Set the tableRef on the match to set the binding to the button
    });
    return await popover.present();
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
