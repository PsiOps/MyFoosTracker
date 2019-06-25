import { Injectable } from '@angular/core';
import { Match, Team } from '../domain';
import { DocumentReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor() { }

  public getTeamIds(match: Match): string[] {
    const teamIds = [];
    const teamAId = this.getTeamId(match.teamA);
    if (teamAId) { teamIds.push(teamAId); }
    const teamBId = this.getTeamId(match.teamB);
    if (teamBId) { teamIds.push(teamBId); }
    return teamIds;
}

public getTeamComboId(match: Match): string {
    return this.getCombinedId(this.getTeamIds(match), '*');
}

public getTeamId(team: { playerRef: DocumentReference }[]): string {
    return this.getCombinedId(team.map(t => t.playerRef.id), '-');
}

public getMatchTeamId(match: Match, team: Team): string {
    return team === Team.teamA ? this.getTeamId(match.teamA) : this.getTeamId(match.teamB);
}

private getCombinedId(ids: string[], separator: string): string {
    return ids.sort().join(separator);
}

}
