import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { PlayerStats, TeamMateStat, Player } from '../../../../domain';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  public playerStatsDoc: AngularFirestoreDocument<PlayerStats>;
  public playerStats$: Observable<PlayerStats> = of(null);
  public teamMateStats$: Observable<{rank: number, name$: Promise<string>}[]> = of([]);

  @Input() playerId: string;
  @Input() isModal: boolean;

  constructor(private afs: AngularFirestore, private modalController: ModalController) { }

  ngOnInit(): void {
    this.playerStatsDoc = this.afs.doc(`player-stats/${this.playerId}`);
    this.playerStats$ = this.playerStatsDoc.valueChanges();
    this.teamMateStats$ = this.playerStatsDoc.valueChanges()
      .pipe(map(s => s.teamMateMatchStats
          .sort((a, b) => this.sortTeamMates(a, b))
          .slice(0, 3))
      )
      .pipe(map(tms => tms.map(this.getRankEntry)));
  }

  public refresh($event: any) {
    setTimeout(() => $event.target.complete(), 500);
  }

  public dismiss() {
    this.modalController.dismiss();
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
    if (aNoOfMatches === bNoOfMatches) {
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
