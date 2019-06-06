import { Match, MatchStatus, Team } from '../domain/match';
import { StatsUpdateService } from './stats-update.service';
import { TeamService } from './team.service';
import { StatsIncrements } from '../models/stats-increments';
import { StatsIncrementService } from './stats-increment.service';
import { Stats } from '../domain/stats';
import { TeamComboStatsIncrements } from '../models/team-combo-stats-increments';
import { TeamComboStats } from '../domain/team-combo-stats';

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
        const teamComboIncrementsById = new Map<string, TeamComboStatsIncrements>();

        const matchDocuments = await this.firestore.collection('matches')
            .where('status', '==', MatchStatus.over)
            .get();

        const matches = matchDocuments.docs.map(ds => ds.data()) as Match[];

        matches.forEach(match => {

            const teamAIncrements = this.statsIncrementService.getIncrements(match, Team.teamA)
            const teamBIncrements = this.statsIncrementService.getIncrements(match, Team.teamB)

            match.participants.forEach(playerId => {
                const playerMatchIncrements = this.teamService.getPlayerTeam(playerId, match) === Team.teamA ? teamAIncrements : teamBIncrements;
                const playerIncrements = playerIncrementsById[playerId];
                if(!playerIncrements) { 
                    playerIncrementsById[playerId] = playerMatchIncrements; 
                } else {
                    this.statsIncrementService.combineIncrements(playerIncrements, playerMatchIncrements);
                }
            })

            const teamIds = this.teamService.getTeamIds(match);
            const teamComboId = this.teamService.getTeamComboId(match);

            let teamComboIncrements: TeamComboStatsIncrements = teamComboIncrementsById[teamComboId];
            if(!teamComboIncrements) {
                teamComboIncrements = new TeamComboStatsIncrements(teamIds, match.participants);
                teamComboIncrementsById[teamComboId] = teamComboIncrements;
            }
            teamIds.forEach(teamId => {
                const teamMatchIncrements = this.teamService.getMatchTeamId(match, Team.teamA) === teamId ? teamAIncrements : teamBIncrements;
                const teamIncrements = teamIncrementsById[teamId];
                if(!teamIncrements) {
                    teamIncrementsById[teamId] = teamMatchIncrements;
                } else {
                    this.statsIncrementService.combineIncrements(teamIncrements, teamMatchIncrements);
                }
                this.statsIncrementService.combineIncrements(teamComboIncrements.incrementsByTeamId[teamId], teamMatchIncrements);
            })
        })

        playerIncrementsById.forEach((increments: StatsIncrements, playerId: string) => {
            const recalculatedPlayerStats = new Stats();
            this.statsUpdateService.updateStats(recalculatedPlayerStats, increments);
            const playerStatsDoc = this.firestore.doc(`player-stats-v2/${playerId}`);
            playerStatsDoc.set(Object.assign({}, recalculatedPlayerStats))
                .catch(err => console.log(err));
        });

        teamIncrementsById.forEach((increments: StatsIncrements, teamId: string) => {
            const recalculatedTeamStats = new Stats();
            this.statsUpdateService.updateStats(recalculatedTeamStats, increments);
            const teamStatsDoc = this.firestore.doc(`team-stats/${teamId}`);
            teamStatsDoc.set(Object.assign({}, recalculatedTeamStats))
                .catch(err => console.log(err));
        });

        teamComboIncrementsById.forEach((increments: TeamComboStatsIncrements, teamComboId: string) => {
            const recalculatedTeamComboStats = new TeamComboStats(increments.teamIds, increments.memberIds);
            increments.teamIds.forEach(teamId => {
                this.statsUpdateService.updateStats(recalculatedTeamComboStats.statsByTeamId[teamId], increments.incrementsByTeamId[teamId]);
            });
            const teamComboStatsDoc = this.firestore.doc(`team-combo-stats/${teamComboId}`);
            teamComboStatsDoc.set(Object.assign({}, recalculatedTeamComboStats))
                .catch(err => console.log(err));
        });
        
        return {message: 'Recalculation complete'}
    }
}