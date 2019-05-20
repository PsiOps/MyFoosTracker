import { Match, Team } from '../domain/match';
import { PlayerStats } from '../domain/player-stats';

export class StatsUpdateService {
    constructor(private firestore: FirebaseFirestore.Firestore) { }
    public async updateStatsForMatch(matchPath: string): Promise<{ message: string }> {
        const match = (await this.firestore.doc(matchPath).get()).data() as Match;
        if (!match) { return { message: 'Unable to update statistics: Match not found' }; }
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
        return { message: 'Succes' }
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
        this.incrementBasicStats(playerStats, matchesWonIncrement, matchesLostIncrement, matchesTiedIncrement,
            matchesOrganizedIncrement, teamGoalsScoredIncrement, matchDurationMinutes);
        this.updateCalculatedStats(playerStats);

        const teamMateId = playerTeam === Team.teamA ?
            this.getTeamMateId(playerId, match.teamA) :
            this.getTeamMateId(playerId, match.teamB)

        if (teamMateId) {
            const teamMateDocRef = this.firestore.doc(`players/${teamMateId}`);
            this.updateTeamMateStatistics(playerStats, teamMateDocRef, matchesWonIncrement, matchesLostIncrement);
        }
    }

    private getTeamMateId(playerId: string, team: { playerRef: FirebaseFirestore.DocumentReference }[]): string {
        const teamPlayerIds = team.map(p => p.playerRef.id)
        return teamPlayerIds.find(id => id !== playerId);
    }

    private incrementBasicStats(playerStats: PlayerStats, matchesWonInc: number, matchesLostInc: number, matchesTiedInc: number,
        matchesOrgInc: number, teamGoalsScoredInc: number, matchDurationInc: number) {
        playerStats.matchesWonCount = playerStats.matchesWonCount + matchesWonInc;
        playerStats.matchesLostCount = playerStats.matchesLostCount + matchesLostInc;
        playerStats.matchesTiedCount = playerStats.matchesTiedCount + matchesTiedInc;
        playerStats.matchesOrganizedCount = playerStats.matchesOrganizedCount + matchesOrgInc;
        playerStats.teamGoalsScoredCount = playerStats.teamGoalsScoredCount + teamGoalsScoredInc;
        playerStats.minutesPlayedCount = playerStats.minutesPlayedCount + matchDurationInc;
    }

    private updateCalculatedStats(playerStats: PlayerStats): void {
        playerStats.matchDurationMinutesAverage = playerStats.minutesPlayedCount / (playerStats.matchesWonCount + playerStats.matchesLostCount);
    }

    private updateTeamMateStatistics(
        playerStats: PlayerStats,
        teamMateDocRef: FirebaseFirestore.DocumentReference,
        matchesWonInc: number,
        matchesLostInc: number) {
        let teammateStats = playerStats.teamMateMatchStats.find(st => st.teamMateRef.id === teamMateDocRef.id);
        if (!teammateStats) {
            teammateStats = { teamMateRef: teamMateDocRef, matchesWonCount: 0, matchesLostCount: 0 }
            playerStats.teamMateMatchStats.push(teammateStats)
        }
        teammateStats.matchesWonCount += matchesWonInc;
        teammateStats.matchesLostCount += matchesLostInc;
    }
}