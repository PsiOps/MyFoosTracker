import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class CloudFunctionsService {

  constructor(private fns: AngularFireFunctions) { }

  public updateStats(matchPath: string) {
    const updateStatsPayload = { matchPath: matchPath, config: {} };
    this.fns.httpsCallable('processMatch')(updateStatsPayload);
  }

  public processGroupArchival(groupId: string) {
    const processGroupArchivalPayload = { groupId: groupId, config: {} };
    this.fns.httpsCallable('processGroupArchival')(processGroupArchivalPayload);
  }
}
