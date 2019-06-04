import { Match, MatchStatus, Team } from '../domain/match';
import { StatsUpdateService } from './stats-update.service';
import { TeamService } from './team.service';
import { StatsIncrements } from '../models/stats-increments';
import { StatsIncrementService } from './stats-increment.service';
import { Stats } from '../domain/stats';

export class StatsRecalcService{
    constructor(
        private statsUpdateService: StatsUpdateService, 
        private statsIncrementService: StatsIncrementService,
        private teamService: TeamService,
        private firestore: FirebaseFirestore.Firestore
        ){}

    public async recalculateStatistics(): Promise<{ message: string }> {
        
        const playerIncrementsById = new Map<string, StatsIncrements>();
        const teamIncrementsById = new Map<string, StatsIncrements>();

        const matchDocuments = await this.firestore.collection('matches')
            .where('status', '==', MatchStatus.over)
            .get();

        const matches = matchDocuments.docs.map(ds => ds.data()) as Match[];

        matches.forEach(match => {

            // Get increments for each team
            const teamAIncrements = this.statsIncrementService.getIncrements(match, Team.teamA)
            const teamBIncrements = this.statsIncrementService.getIncrements(match, Team.teamB)

            match.participants.forEach(playerId => {
                const playerIncrements = this.teamService.getPlayerTeam(playerId, match) === Team.teamA ? teamAIncrements : teamBIncrements;
                // Apply the increments to the existing increments in the playerIncrementsById
            })

            const teamIds = this.teamService.getTeamIds(match);

            teamIds.forEach(teamId => {
                const teamIncrements = this.teamService.getMatchTeamId(match, Team.teamA) === teamId ? teamAIncrements : teamBIncrements;
                // Apply the increments to the existing increments in the teamIncrementsById
            })

            const teamComboId = this.teamService.getTeamComboId(match);
            // Apply the increments to the existing increments in the teamIncrementsById            
        })

        playerIncrementsById.forEach((increments: StatsIncrements, playerId: string) => {
            const recalculatedPlayerStats = new Stats();
            this.statsUpdateService.updateStats(recalculatedPlayerStats, increments);
            const playerStatsDoc = this.firestore.doc(`player-stats-v2/${playerId}`);
            playerStatsDoc.set(Object.assign({}, recalculatedPlayerStats))
                .catch(err => console.log(err));
        });

        return {message: 'Recalculation complete'}
    }
}