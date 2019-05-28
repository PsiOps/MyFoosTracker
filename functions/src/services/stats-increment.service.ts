import { Match, Team } from '../domain/match';
import { PlayerStats } from '../domain/player-stats';
import { StatsIncrements } from '../models/stats-increments';

export class StatsIncrementService {
    getIncrements(match: Match, team: Team): StatsIncrements {
        const increments = new StatsIncrements();

        

        return increments;
    }

    public incrementPlayerStats(stats: PlayerStats, match: Match, team: Team, playerId?: string): void {

    }
}