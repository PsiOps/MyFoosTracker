import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamComboStats, TeamModel, Stats } from '../../../../domain';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class TeamComboStatsModel {
  public teamName$: Observable<string>;
  public metric: number;
  public info: string;
  public secondarySorter: number;
  public format: string;
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
  public selectedMetric$: BehaviorSubject<string>  = new BehaviorSubject('winLossRatio');

  public teamStats$: Observable<TeamComboStatsModel[]>;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    const teamComboStatsForPlayer = this.afs.collection<TeamComboStats>('team-combo-stats',
      ref => ref.where('memberIds', 'array-contains', this.player.id)
    );

    this.teamStats$ = combineLatest(
        teamComboStatsForPlayer.valueChanges(),
        this.selectedStatsMode$,
        this.selectedMetric$
      )
      .pipe(map(([teamComboStatsList, mode, metric]) =>
        teamComboStatsList.map(stats => {
// tslint:disable-next-line: triple-equals
          const isMyTeams = mode == TeamStatsMode.MyTeams; // Double equals is intentional, otherwise it doesn't work :|
          let teamKey: string;

          for (const teamId in stats.statsByTeamId) {
            if (teamId.includes(this.player.id) === isMyTeams) {
              teamKey = teamId;
            }
          }
          const teamStats = stats.statsByTeamId[teamKey];

          return { teamId: teamKey, stats: { ...teamStats} };

        })
        .reduce((groups: { teamId: string, stats: Stats}[], item: { teamId: string, stats: Stats}) => {
          const key = item.teamId;
          const existingItem = groups.find(i => i.teamId === key);
          if (existingItem) {
            existingItem.stats.matchesWon += item.stats.matchesWon;
            existingItem.stats.matchesLost += item.stats.matchesLost;
            existingItem.stats.matchesTied += item.stats.matchesTied;
            existingItem.stats.averageMatchDuration += item.stats.averageMatchDuration;
            existingItem.stats.minutesPlayed += item.stats.minutesPlayed;
            existingItem.stats.goalsScored += item.stats.goalsScored;
            existingItem.stats.goalsAgainst += item.stats.goalsAgainst;
          } else {
            groups.push(item);
          }
          return groups;
        }, [])
        .map(item => {
          const teamComboStatsModel = new TeamComboStatsModel();

          teamComboStatsModel.teamName$ = this.afs.doc<TeamModel>(`teams/${item.teamId}`).valueChanges()
           .pipe(map(t => t.name))
           .pipe(catchError(e => of('<team X>')));

          if (metric === 'winLossRatio') {
            teamComboStatsModel.metric =  item.stats.matchesWon / item.stats.matchesLost;
            teamComboStatsModel.info = `W: ${item.stats.matchesWon} L: ${item.stats.matchesLost}`;
            teamComboStatsModel.secondarySorter = item.stats.matchesWon + item.stats.matchesLost;
            teamComboStatsModel.format = '1.1-1';
          } else if (metric === 'matchesPlayed') {
            teamComboStatsModel.metric =  item.stats.matchesWon + item.stats.matchesLost;
            teamComboStatsModel.info = `W: ${item.stats.matchesWon} L: ${item.stats.matchesLost}`;
          } else if (metric === 'averageMatchDuration') {
            teamComboStatsModel.metric = item.stats[metric];
            teamComboStatsModel.format = '1.1-1';
          } else {
            teamComboStatsModel.metric = item.stats[metric];
            teamComboStatsModel.format = '1.0';
          }

          return teamComboStatsModel;
        })
        .sort((a, b) => this.sortStatsByMetric(a, b))
      ));
  }

  public selectedModeChanged($event: CustomEvent) {
    this.selectedStatsMode$.next($event.detail.value as TeamStatsMode);
  }

  public selectedMetricChanged($event: CustomEvent) {
    this.selectedMetric$.next($event.detail.value as string);
  }

  private sortStatsByMetric(a: TeamComboStatsModel, b: TeamComboStatsModel): number {
    const aScore = a.metric;
    const bScore = b.metric;
    if (aScore === bScore) {
      return this.sortStatsBySecundary(a, b);
    }
    return bScore > aScore ? 1 : -1;
  }

  private sortStatsBySecundary(a: TeamComboStatsModel, b: TeamComboStatsModel): number {
    const aScore = a.secondarySorter;
    const bScore = b.secondarySorter;
    if (aScore === bScore) {
      return 0;
    }
    return bScore > aScore ? 1 : -1;
  }
}

