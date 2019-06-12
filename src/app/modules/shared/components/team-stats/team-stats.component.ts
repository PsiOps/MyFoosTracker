import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamComboStats, TeamModel } from '../../../../domain';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export class TeamComboStatsModel {
  public teamName$: Observable<string>;
  public metric: number;
}

export enum TeamStatsMode {
  MyTeams, OpponentTeams
}

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.scss']
})
export class TeamStatsComponent implements OnInit {

  @Input() player: { id: string, nickname: string, photoUrl: string };
  public selectedStatsMode$: BehaviorSubject<TeamStatsMode>  = new BehaviorSubject(0);

  public teamStats$: Observable<TeamComboStatsModel[]>;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    const teamComboStatsForPlayer = this.afs.collection<TeamComboStats>('team-combo-stats',
      ref => ref.where('memberIds', 'array-contains', this.player.id)
    );

    this.teamStats$ = teamComboStatsForPlayer.valueChanges()
      .pipe(tap(s => console.log(s)))
      .pipe(map(s =>
        s.map(stats => {
          const teamComboStatsModel = new TeamComboStatsModel();
          let teamKey: string;

          for (const teamId in stats.statsByTeamId) {
            if (teamId.includes(this.player.id)) {
              teamKey = teamId;
            }
          }

          teamComboStatsModel.teamName$ = this.afs.doc<TeamModel>(`teams/${teamKey}`).valueChanges()
            .pipe(map(t => t.name));

          const teamStats = stats.statsByTeamId[teamKey];

          teamComboStatsModel.metric = teamStats.matchesWon;

          return teamComboStatsModel;
        })
        // TODO: Group by team Key! 
        .sort((a, b) => b.metric - a.metric)
      ));
  }

  public selectedModeChanged($event: CustomEvent) {
    this.selectedStatsMode$.next($event.detail.value as TeamStatsMode);
  }
}

