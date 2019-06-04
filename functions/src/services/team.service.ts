import * as admin from 'firebase-admin';
import { Team, Match } from '../domain/match';

export class TeamService {
    
    getPlayerTeam(playerId: string, match: Match): Team {
        return match.teamA.map(m => m.playerRef.id).includes(playerId) ? Team.teamA : Team.teamB;
    }

    getWinningTeam(match: Match): Team {
        return match.goalsTeamA === match.goalsTeamB ? Team.none 
            : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
    }

    public getTeamIds(match: Match): string[]{
        return [this.getTeamId(match.teamA), this.getTeamId(match.teamB)];
    }

    public getTeamComboId(match: Match): string{
        return this.getCombinedId(this.getTeamIds(match));
    }

    public getTeamId(team: {playerRef: admin.firestore.DocumentReference}[]): string {
        return this.getCombinedId(team.map(t => t.playerRef.id));
    }

    public getMatchTeamId(match: Match, team: Team): string {
        return team === Team.teamA ? this.getTeamId(match.teamA) : this.getTeamId(match.teamB);
    }

    private getCombinedId(ids: string[]): string {
        return ids.sort().join('-');
    }
}