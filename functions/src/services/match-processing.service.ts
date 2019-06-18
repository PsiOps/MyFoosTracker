import { Team } from '../domain/match';
import { StatsUpdateService } from './stats-update.service';
import { StatsIncrementService } from './stats-increment.service';
import { TeamService } from './team.service';
import { MatchService } from './match.service';

export class MatchProcessingService {

    constructor(
        private matchService: MatchService,
        private statsIncrementService: StatsIncrementService,
        private statsUpdateService: StatsUpdateService,
        private teamService: TeamService
    ) { }

    public async processMatch(matchPath: string): Promise<{ message: string }> {
        const match = await this.matchService.getMatch(matchPath);
        if (!match) { return { message: 'Unable to update statistics: Match not found' }; }
                
        await this.teamService.ensureTeams(match);

        const teamAIncrements = this.statsIncrementService.getIncrements(match, Team.teamA);
        const teamBIncrements = this.statsIncrementService.getIncrements(match, Team.teamB);

        await this.statsUpdateService.updatePlayerStatsForMatch(match, teamAIncrements, teamBIncrements);
        await this.statsUpdateService.updateTeamStatsForMatch(match, teamAIncrements, teamBIncrements);
        await this.statsUpdateService.updateTeamComboStatsForMatch(match, teamAIncrements, teamBIncrements);
       
        return { message: 'Succes' }
    }
}