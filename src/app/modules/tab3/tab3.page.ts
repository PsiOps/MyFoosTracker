import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthenticationService } from '../../auth/authentication.service';
import { PlayerStats, TeamMateStat, Player } from '../../domain';
import { of, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  public playerStatsDoc: AngularFirestoreDocument<PlayerStats>;
  public playerStats$: Observable<PlayerStats> = of(null);
  public teamMateStats$: Observable<{rank: number, name$: Promise<string>}[]> = of([]);

  constructor(private afs: AngularFirestore, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.playerStatsDoc = this.afs.doc(`player-stats/${this.authService.user.uid}`);
    this.playerStats$ = this.playerStatsDoc.valueChanges();
    this.teamMateStats$ = this.playerStatsDoc.valueChanges()
      .pipe(map(s => s.teamMateMatchStats
          .sort((a, b) => this.sortTeamMates(a, b))
          .slice(0, 3))
      )
      .pipe(map(tms => tms.map(this.getRankEntry)));
  }

  private sortTeamMates(a: TeamMateStat, b: TeamMateStat): number {
    const aNoOfMatches = a.matchesLostCount + a.matchesWonCount;
    const bNoOfMatches = b.matchesLostCount + b.matchesWonCount;
    let result: number = this.sortByPreliminary(aNoOfMatches, bNoOfMatches);
    if (result === 0) {
      result = this.sortByRatio(a, b);
    }
    if (result === 0) {
      result = this.sortByNoOfMatches(aNoOfMatches, bNoOfMatches);
    }
    return result;
  }

  private sortByPreliminary(aNoOfMatches: number, bNoOfMatches: number): number {
    if (aNoOfMatches > 2 === bNoOfMatches > 2) {
      return 0;
    }
    return bNoOfMatches > 2 ? 1 : -1;
  }

  private sortByRatio(a: TeamMateStat, b: TeamMateStat): number {
    const aRatio = a.matchesWonCount / a.matchesLostCount;
    const bRatio = b.matchesWonCount / b.matchesLostCount;
    if (aRatio === bRatio) {
      return 0;
    }
    return bRatio > aRatio ? 1 : -1;
  }

  private sortByNoOfMatches(aNoOfMatches: number, bNoOfMatches: number): number {
    if(aNoOfMatches === bNoOfMatches) {
      return 0;
    }
    return bNoOfMatches > aNoOfMatches ? 1 : -1;
  }

  private getRankEntry(teamMateStat: TeamMateStat, index: number): {rank: number, name$: Promise<string>} {
    const namePromise = teamMateStat.teamMateRef.get()
      .then(doc => (doc.data() as Player).nickname);
    return { rank: index + 1, name$: namePromise };
  }
}


