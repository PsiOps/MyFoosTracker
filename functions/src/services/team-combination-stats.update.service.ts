import { Match, Team } from '../domain/match';
import { TeamStats, TeamCombinationStats } from '../domain/team-stats';
import { TeamService } from './team.service';

export class TeamCombinationStatsUpdateService {
    constructor(
        private firestore: FirebaseFirestore.Firestore, 
        private teamService: TeamService
        ) {}

    public async updateTeamCombinationStatsForMatch(match: Match, teamIds: string[]): Promise<void> {
        const teamCombinationId = this.teamService.getTeamCombinationId(teamIds);
        const teamCombinationStatsDocRef = this.firestore.doc(`team-combination-stats/${teamCombinationId}`);
        await this.firestore.runTransaction(async transaction => {
            const doc = await transaction.get(teamCombinationStatsDocRef);
            const currentStats = doc.data() as TeamCombinationStats;
            if (!currentStats) {
                const newStats = new TeamCombinationStats(teamIds);
                this.updateTeamCombinationStats(match, teamIds, newStats);
                transaction.set(teamCombinationStatsDocRef, Object.assign({}, newStats))
                return;
            }
            this.updateTeamCombinationStats(match, teamIds, currentStats);
            transaction.update(teamCombinationStatsDocRef, Object.assign({}, currentStats))
        });
    }

    public updateTeamCombinationStats(match: Match, teamIds: string[], teamCombinationStats: TeamCombinationStats) {
        teamIds.forEach(teamId => {
            let teamSubStats = teamCombinationStats.statsByTeamId[teamId];
            if(!teamSubStats){
                teamSubStats = new TeamStats();
                teamCombinationStats.statsByTeamId[teamId] = teamSubStats;
            }
            
        })
    }
}