import { Match, Team } from '../domain/match';
import { PlayerStats } from '../domain/player-stats';
import { StatsIncrements } from '../models/stats-increments';

export class StatsUpdateService {
    constructor(private firestore: FirebaseFirestore.Firestore) { }

    public async updatePlayerStatsForMatch(match: Match, teamAIncrements: StatsIncrements, teamBIncrements: StatsIncrements): Promise<void> {
        match.participants.forEach(async playerId => {
            const playerStatsDocRef = this.firestore.doc(`player-stats/${playerId}`);
            await this.firestore.runTransaction(async transaction => {
                const doc = await transaction.get(playerStatsDocRef);
                const currentStats = doc.data() as PlayerStats;
                if (!currentStats) {
                    const newStats = new PlayerStats();
                    this.updatePlayerStats(match, playerId, newStats);
                    transaction.set(playerStatsDocRef, Object.assign({}, newStats))
                    return;
                }
                this.updatePlayerStats(match, playerId, currentStats);
                transaction.update(playerStatsDocRef, Object.assign({}, currentStats))
            });
        });
    }
    
    public updatePlayerStats(match: Match, playerId: string, playerStats: PlayerStats) {
        const winningTeam = match.goalsTeamA === match.goalsTeamB ? Team.none : (match.goalsTeamA > match.goalsTeamB ? Team.teamA : Team.teamB);
        const diffMs = match.dateTimeEnd.valueOf() - match.dateTimeStart.valueOf();
        const matchDurationMinutes = Math.floor((diffMs / 1000) / 60);
        const playerTeam: Team = match.teamA.map(p => p.playerRef.id).indexOf(playerId) >= 0 ?
            Team.teamA : Team.teamB
        const isWinner = playerTeam === winningTeam;
        const isTie = winningTeam === Team.none;
        const isOrganizer = playerId === match.organizer;
        const matchesWonIncrement = isWinner ? 1 : 0;
        const matchesLostIncrement = isWinner ? 0 : (isTie ? 0 : 1);
        const matchesTiedIncrement = isTie ? 1 : 0;
        const matchesOrganizedIncrement = isOrganizer ? 1 : 0;
        const teamGoalsScoredIncrement = playerTeam === Team.teamA ? match.goalsTeamA : match.goalsTeamB;
        const teamGoalsAgainstIncrement = playerTeam === Team.teamB ? match.goalsTeamA : match.goalsTeamB;
        this.incrementBasicStats(playerStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
            matchesOrganizedIncrement, teamGoalsScoredIncrement, teamGoalsAgainstIncrement, matchDurationMinutes);
        this.updateCalculatedStats(playerStats);
    }

    private incrementBasicStats(playerStats: PlayerStats, matchesWonInc: number, matchesLostInc: number, matchesTiedInc: number,
        matchesOrgInc: number, teamGoalsScoredInc: number, teamGoalsAgainstInc: number, matchDurationInc: number) {
        playerStats.matchesWon = playerStats.matchesWon + matchesWonInc;
        playerStats.matchesLost = playerStats.matchesLost + matchesLostInc;
        playerStats.matchesTied = playerStats.matchesTied + matchesTiedInc;
        playerStats.matchesOrganized = playerStats.matchesOrganized + matchesOrgInc;
        playerStats.teamGoalsScored = playerStats.teamGoalsScored + teamGoalsScoredInc;
        playerStats.teamGoalsAgainst = playerStats.teamGoalsAgainst + teamGoalsAgainstInc;
        playerStats.minutesPlayed = playerStats.minutesPlayed + matchDurationInc;
    }

    private updateCalculatedStats(playerStats: PlayerStats): void {
        playerStats.averageMatchDuration = playerStats.minutesPlayed / (playerStats.matchesWon + playerStats.matchesLost);
    }
}