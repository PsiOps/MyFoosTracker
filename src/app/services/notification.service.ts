import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatchService } from './match.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private fns: AngularFireFunctions,
    private matchService: MatchService
  ) { }

  public async sendInvites(): Promise<void> {
    const matchPath = this.matchService.currentMatchDocRef.path;
    const updateStatsPayload = { matchPath: matchPath, config: {} };
    const response = await this.fns.httpsCallable('sendMatchInvitations')(updateStatsPayload).toPromise();
  }
}
