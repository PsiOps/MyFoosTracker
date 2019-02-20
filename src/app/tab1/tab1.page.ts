import { Component } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { Router } from '@angular/router';
import { Team } from '../domain/match';
import { ToastController } from '@ionic/angular';
import { Player } from '../domain/player';
import { MatchService } from '../services/match.service';
import { ModalController } from '@ionic/angular';
import { PlayerSelectComponent } from './components/player-select/player-select.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public isInEditMode = false;
  public gamePin?: number = null;
  constructor(public authService: AuthenticationService,
    private matchService: MatchService,
    private router: Router,
    private toastController: ToastController,
    private modalController: ModalController) {
    this.matchService.findCurrentMatch();
  }
  public async createMatch(player: Player) {
    this.matchService.createMatch(player);
  }
  public async addPlayers() {
    const modal = await this.modalController.create({
      component: PlayerSelectComponent,
      componentProps: { value: 123 }
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
    await this.matchService.onScored($event);
  }
  public async onScoringCancelled() {
    await this.matchService.onScoringCancelled();
  }
  public async onMatchJoined($event: Team) {
    await this.matchService.onMatchJoined($event);
  }
  public async leaveTeam() {
    await this.matchService.leaveMatch();
  }
  public async leaveMatch() {
    await this.matchService.leaveMatch();
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
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
