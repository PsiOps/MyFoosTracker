import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthenticationService } from '../../auth/authentication.service';
import { PlayerStats } from '../../domain';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  public playerStatsDoc: AngularFirestoreDocument<PlayerStats>;
  public playerStats$: Observable<PlayerStats> = of(null);

  constructor(private afs: AngularFirestore, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.playerStatsDoc = this.afs.doc(`player-stats/${this.authService.user.uid}`);
    this.playerStats$ = this.playerStatsDoc.valueChanges();
  }
}
