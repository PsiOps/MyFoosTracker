import * as admin from 'firebase-admin';
import { Team, Match } from '../domain/match';
import { Player } from '../domain/player';

export class TeamService {

    constructor(private firestore: FirebaseFirestore.Firestore) { }

    public async ensureTeams(match: Match) {
        const teamIds = this.getTeamIds(match);
        for (const teamId of teamIds) {
            const teamDoc = await this.firestore.doc(`teams/${teamId}`).get();
            if (teamDoc.exists) { continue; }
            const teamName = await this.getTeamName(teamId);
            teamDoc.ref.set({ name: teamName }).catch(err => console.log(err));                       
        }
    }

    public async getTeamName(teamId: string): Promise<string> {
        const playerNames = [];

        for (const playerId of teamId.split('-')) {
            try {
                const playerDoc = await this.firestore.doc(`players/${playerId}`).get();
                const player = playerDoc.data() as Player;
                playerNames.push(player.nickname);
            } catch (error) {
                console.log(error);
            }
        }
        return playerNames.join(' & ');
    }

    getPlayerTeam(playerId: string, match: Match): Team {
        return match.teamA.map(m => m.playerRef.id).includes(playerId) ? Team.teamA : Team.teamB;
    }

    getWinningTeam(match: Match): Team {
        return match.goalsTeamA === match.goalsTeamB ? Team.none
            : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
    }

    public getTeamIds(match: Match): string[] {
        const teamIds = [];
        const teamAId = this.getTeamId(match.teamA);
        if (teamAId) { teamIds.push(teamAId) }
        const teamBId = this.getTeamId(match.teamB);
        if (teamBId) { teamIds.push(teamBId) }
        return teamIds;
    }

    public getTeamComboId(match: Match): string {
        return this.getCombinedId(this.getTeamIds(match), '*');
    }

    public getTeamId(team: { playerRef: admin.firestore.DocumentReference }[]): string {
        return this.getCombinedId(team.map(t => t.playerRef.id), '-');
    }

    public getMatchTeamId(match: Match, team: Team): string {
        return team === Team.teamA ? this.getTeamId(match.teamA) : this.getTeamId(match.teamB);
    }

    private getCombinedId(ids: string[], separator: string): string {
        return ids.sort().join(separator);
    }
}