import { Match, MatchStatus, Team } from '../domain/match';
import { StatsUpdateService } from './stats-update.service';
import { TeamService } from './team.service';
import { StatsIncrements } from '../models/stats-increments';
import { StatsIncrementService } from './stats-increment.service';
import { Stats } from '../domain/stats';
import { TeamComboStatsIncrements } from '../models/team-combo-stats-increments';
import { TeamComboStats } from '../domain/team-combo-stats';

export class StatsRecalcService {
    constructor(
        private statsUpdateService: StatsUpdateService,
        private statsIncrementService: StatsIncrementService,
        private teamService: TeamService,
        private firestore: FirebaseFirestore.Firestore
    ) { }

    public async recalculateStatistics(): Promise<{ message: string }> {

        const playerIncrementsById = new Map<string, StatsIncrements>();
        const teamIncrementsById = new Map<string, StatsIncrements>();
        const teamComboIncrementsById = new Map<string, TeamComboStatsIncrements>();

        const matchDocuments = await this.firestore.collection('matches')
            .where('status', '==', MatchStatus.over)
            .get();

        const matches = matchDocuments.docs.map(ds => ds.data()) as Match[];

        for(const match of matches) {
            const teamAIncrements = this.statsIncrementService.getIncrements(match, Team.teamA)
            const teamBIncrements = this.statsIncrementService.getIncrements(match, Team.teamB)

            for(const playerId of match.participants){
                const playerMatchIncrements = this.teamService.getPlayerTeam(playerId, match) === Team.teamA ? teamAIncrements : teamBIncrements;
                const playerIncrements = playerIncrementsById.get(playerId);
                if (!playerIncrements) {
                    playerIncrementsById.set(playerId, playerMatchIncrements);
                } else {
                    this.statsIncrementService.combineIncrements(playerIncrements, playerMatchIncrements);
                }
            }

            const teamIds = this.teamService.getTeamIds(match);
            const teamComboId = this.teamService.getTeamComboId(match);

            let teamComboIncrements: TeamComboStatsIncrements = teamComboIncrementsById.get(teamComboId);
            if (!teamComboIncrements) {
                teamComboIncrements = new TeamComboStatsIncrements(teamIds, match.participants);
                teamComboIncrementsById.set(teamComboId, teamComboIncrements);
            }

            for(const teamId of teamIds) {
                const teamMatchIncrements = this.teamService.getMatchTeamId(match, Team.teamA) === teamId ? teamAIncrements : teamBIncrements;
                const teamIncrements = teamIncrementsById.get(teamId);
                if (!teamIncrements) {
                    teamIncrementsById.set(teamId, teamMatchIncrements);
                } else {
                    this.statsIncrementService.combineIncrements(teamIncrements, teamMatchIncrements);
                }
                this.statsIncrementService.combineIncrements(teamComboIncrements.incrementsByTeamId.get(teamId), teamMatchIncrements);
            }
        }

        for (const [playerId, increments] of playerIncrementsById) {
            const recalculatedPlayerStats = new Stats();
            this.statsUpdateService.updateStats(recalculatedPlayerStats, increments);
            const playerStatsDoc = this.firestore.doc(`player-stats-v2/${playerId}`);
            playerStatsDoc.set(Object.assign({}, recalculatedPlayerStats))
                .catch(err => console.log(err));
        }

        for(const [teamId, increments] of teamIncrementsById) {
            const recalculatedTeamStats = new Stats();
            this.statsUpdateService.updateStats(recalculatedTeamStats, increments);
            const teamStatsDoc = this.firestore.doc(`team-stats/${teamId}`);
            teamStatsDoc.set(Object.assign({}, recalculatedTeamStats))
                .catch(err => console.log(err));
        }

        for(const [teamComboId, increments] of teamComboIncrementsById) {
            console.log(`Saving TeamCombo Stats for ${teamComboId}`, increments);
            const recalculatedTeamComboStats = new TeamComboStats(increments.teamIds, increments.memberIds);
            increments.teamIds.forEach(teamId => {
                this.statsUpdateService.updateStats(recalculatedTeamComboStats.statsByTeamId[teamId], increments.incrementsByTeamId.get(teamId));
            });
            const teamComboStatsDoc = this.firestore.doc(`team-combo-stats/${teamComboId}`);
            teamComboStatsDoc.set(JSON.parse(JSON.stringify(recalculatedTeamComboStats)))
                 .catch(err => console.log(err));
        }

        return { message: 'Recalculation complete' }
    }
}