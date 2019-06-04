import { Match, Team } from '../domain/match';
import { StatsIncrements } from '../models/stats-increments';
import { StatsIncrementService } from './stats-increment.service';
import { TeamService } from './team.service';
import { Stats } from '../domain/stats';
import { TeamComboStats } from '../domain/team-combo-stats';

export class StatsUpdateService {
    constructor(
        private firestore: FirebaseFirestore.Firestore,
        private teamService: TeamService,
        private incrementService: StatsIncrementService,
        ) { }

    // - For Each PlayerId
    // - Determine the team this player is in (should be TeamService method)
    // - Inside a transaction:
    // - Get the PlayerStats (if exist)
    // - Apply the increments of the right Team (use incrementService method)
    // - Apply the transaction
    public async updatePlayerStatsForMatch(match: Match, teamAIncrements: StatsIncrements, teamBIncrements: StatsIncrements): Promise<void> {
        match.participants.forEach(async playerId => {
            const playerIncrements = this.teamService.getPlayerTeam(playerId, match) === Team.teamA ? teamAIncrements : teamBIncrements;
            const playerStatsDocRef = this.firestore.doc(`player-stats-v2/${playerId}`);
            await this.firestore.runTransaction(async transaction => {
                const doc = await transaction.get(playerStatsDocRef);
                const currentStats = doc.data() as Stats;
                if (!currentStats) {
                    const newStats = new Stats();
                    this.updateStats(newStats, playerIncrements)
                    transaction.set(playerStatsDocRef, Object.assign({}, newStats))
                    return;
                }
                this.updateStats(currentStats, playerIncrements)
                transaction.update(playerStatsDocRef, Object.assign({}, currentStats))
            });
        });
    }

    // - For Each TeamId
    // - Determine whether team is Team A or Team B (should be TeamService method)
    // - Inside a transaction:
    // - Get the TeamStats (if exist)
    // - Apply the increments of the right Team (use incrementService method)
    // - Apply the transaction
    public async updateTeamStatsForMatch(match: Match, teamAIncrements: StatsIncrements, teamBIncrements: StatsIncrements): Promise<void> {
        const teamIds = this.teamService.getTeamIds(match);
        teamIds.forEach(async teamId => {
            const teamIncrements = teamId === this.teamService.getMatchTeamId(match, Team.teamA) ? teamAIncrements : teamBIncrements;
            const TeamStatsDocRef = this.firestore.doc(`team-stats/${teamId}`);
            await this.firestore.runTransaction(async transaction => {
                const doc = await transaction.get(TeamStatsDocRef);
                const currentStats = doc.data() as Stats;
                if (!currentStats) {
                    const newStats = new Stats();
                    this.updateStats(newStats, teamIncrements)
                    transaction.set(TeamStatsDocRef, Object.assign({}, newStats))
                    return;
                }
                this.updateStats(currentStats, teamIncrements)
                transaction.update(TeamStatsDocRef, Object.assign({}, currentStats))
            });
        });
    }

    // - For the Team Combo Id
    // - Inside a transaction:
    // - Get the TeamComboStats (if exist)
    // - Apply the increments to both Teams Stats (use incrementService method)
    // - Apply the transaction
    public async updateTeamComboStatsForMatch(match: Match, teamAIncrements: StatsIncrements, teamBIncrements: StatsIncrements): Promise<void> {
        const teamIds = this.teamService.getTeamIds(match);
        const teamComboId = this.teamService.getTeamComboId(match);
        const incrementsByTeamId = new Map<string, StatsIncrements>(teamIds.map(teamId => {
            return [teamId, this.teamService.getMatchTeamId(match, Team.teamA) === teamId ? teamAIncrements : teamBIncrements]
        }));
        const TeamComboStatsDocRef = this.firestore.doc(`team-combo-stats/${teamComboId}`);
        await this.firestore.runTransaction(async transaction => {
            const doc = await transaction.get(TeamComboStatsDocRef);
            const currentStats = doc.data() as TeamComboStats;
            if (!currentStats) {
                const newStats = new TeamComboStats(teamIds, match.participants);
                this.updateTeamComboStats(newStats, incrementsByTeamId)
                transaction.set(TeamComboStatsDocRef, Object.assign({}, newStats))
                return;
            }
            this.updateTeamComboStats(currentStats, incrementsByTeamId)
            transaction.update(TeamComboStatsDocRef, Object.assign({}, currentStats))
        });
    }

    updateTeamComboStats(teamComboStats: TeamComboStats, incrementsByTeamId: Map<string, StatsIncrements>) {
        teamComboStats.teamIds.forEach(teamId => {
            const stats = teamComboStats.statsByTeamId[teamId];
            this.updateStats(stats, incrementsByTeamId[teamId]);
            this.updateCalculatedStats(stats);
        })
    }

    public updateStats(stats: Stats, increments: StatsIncrements) {
        this.incrementService.incrementStats(stats, increments);
        this.updateCalculatedStats(stats);
    }

    private updateCalculatedStats(stats: Stats): void {
        stats.averageMatchDuration = stats.minutesPlayed / (stats.matchesWon + stats.matchesLost);
    }
}