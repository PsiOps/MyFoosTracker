import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../domain';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  public currentMessage = new BehaviorSubject(null);
  constructor(
    private playerService: PlayerService,
    private afm: AngularFireMessaging) { }

  public requestPermission(player: Player) {
    this.afm.requestToken.subscribe(
      (token) => {
        this.playerService.saveToken(player, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
  public monitorTokenRefresh(player: Player) {
    this.afm.tokenChanges.subscribe(token => {
      this.playerService.saveToken(player, token);
    });
  }
  public receiveMessages() {
    this.afm.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        this.currentMessage.next(payload);
      });
  }
}
