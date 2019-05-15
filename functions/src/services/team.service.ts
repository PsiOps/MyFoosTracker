import { Match } from '../domain/match';
import * as admin from 'firebase-admin';
import { TeamModel } from '../domain/team.model';
import { Player } from '../domain/player';

export class TeamService {

    constructor(private firestore: FirebaseFirestore.Firestore) { }

    public async ensureTeams(match: Match): Promise<string[]> {
        const teamAId = this.getTeamId(match.teamA);
        const teamBId = this.getTeamId(match.teamB);
        const teamA = (await this.firestore.doc(`teams/${teamAId}`).get()).data();
        if (!teamA) {
            await this.addTeam(teamAId, match.teamA);
        }
        const teamB = (await this.firestore.doc(`teams/${teamBId}`).get()).data();
        if (!teamB) {
            await this.addTeam(teamBId, match.teamB);
        }
        return [teamAId, teamBId];
    }

    private async addTeam(teamId: string, team: { playerRef: admin.firestore.DocumentReference, goals: number }[]): Promise<void> {
        const teamMemberNames: string[] = [];
        const teamPlayerRefs = team.map(t => t.playerRef);
        teamPlayerRefs.map(p => p.get().then(playerDoc => {
            const player = playerDoc.data() as Player;
            teamMemberNames.push(player.nickname);
        }));
        const teamModel = new TeamModel();
        teamModel.name = teamMemberNames.join(' & ');
        teamModel.members = teamPlayerRefs.map(ref => ref.id);
        await this.firestore.doc(`teams/${teamId}`).set(teamModel);
    }

    public getTeamId(team: {playerRef: admin.firestore.DocumentReference}[]): string {
        return this.getTeamCombinationId(team.map(t => t.playerRef.id));
    }

    public getTeamCombinationId(teamIds: string[]): string {
        return teamIds.sort().join('-');
    }
}