import { Injectable } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  public currentMessage = new BehaviorSubject(null);
  constructor(
    private authService: AuthenticationService,
    private afm: AngularFireMessaging) { }

  public requestPermission(player: Player) {
    console.log('Requesting Messaging Permission');
    this.afm.requestToken.subscribe(
      (token) => {
        console.log(token);
        this.saveToken(player, token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }
  public monitorTokenRefresh(player: Player) {
    this.afm.tokenChanges.subscribe(token => {
      console.log('Token refreshed');
      this.saveToken(player, token);
    });
  }
  public receiveMessages() {
    this.afm.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        this.currentMessage.next(payload);
      });
  }
  private saveToken(player: Player, token: string): void {
    const currentTokens = player.fcmTokens || {};
    // If token does not exist in firestore, update db
    if (!currentTokens[token]) {
      const tokens = { ...currentTokens, [token]: true };
      this.authService.playerDoc.update({ fcmTokens: tokens });
    }
  }
}
