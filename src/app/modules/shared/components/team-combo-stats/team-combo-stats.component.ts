import { Component, Input, OnChanges } from '@angular/core';
import { Match, TeamComboStats, Stats, Team } from 'src/app/domain';
import { AngularFirestore } from '@angular/fire/firestore';
import { TeamService } from 'src/app/services/team.service';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-team-combo-stats',
  templateUrl: './team-combo-stats.component.html',
  styleUrls: ['./team-combo-stats.component.scss']
})
export class TeamComboStatsComponent implements OnChanges {

  @Input() match: Match;

  public teamComboStats$: Observable<TeamComboStats>;
  public teamAStats$: Observable<Stats>;
  public teamBStats$: Observable<Stats>;

  constructor(private afs: AngularFirestore, private teamService: TeamService) { }

  ngOnChanges() {
    const teamAId = this.teamService.getMatchTeamId(this.match, Team.teamA);
    const teamBId = this.teamService.getMatchTeamId(this.match, Team.teamB);
    const teamComboStatsId = this.teamService.getTeamComboId(this.match);
    const teamComboStatsDoc = this.afs.doc<TeamComboStats>(`team-combo-stats/${teamComboStatsId}`);

    this.teamComboStats$ = teamComboStatsDoc.valueChanges();

    this.teamAStats$ = teamComboStatsDoc.valueChanges()
      .pipe(filter(s => !!s))
      .pipe(map(s => {
        return teamAId ? s.statsByTeamId[teamAId] : null;
      }));
    this.teamBStats$ = teamComboStatsDoc.valueChanges()
      .pipe(filter(s => !!s))
      .pipe(map(s => {
        return teamBId ? s.statsByTeamId[teamBId] : null;
      }));

  }

}
