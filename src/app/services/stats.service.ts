import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private fns: AngularFireFunctions) { }

  public updateStats(matchPath: string) {
    const updateStatsPayload = { matchPath: matchPath, config: {} };
    this.fns.httpsCallable('updatePlayerStats')(updateStatsPayload);
  }
}
