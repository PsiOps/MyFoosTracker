import { Match } from '../domain/match';
import { TeamStatsUpdateService } from './team-stats.update.service';
import { PlayerStatsUpdateService } from './player-stats.update.service';
import { TeamService } from './team.service';

export class MatchProcessingService {

    constructor(
        private firestore: FirebaseFirestore.Firestore,
        private teamService: TeamService,
        private teamStatsUpdateService: TeamStatsUpdateService,
        private playerStatsUpdateService: PlayerStatsUpdateService
    ) { }

    public async processMatch(matchPath: string): Promise<{ message: string }> {
        const match = (await this.firestore.doc(matchPath).get()).data() as Match;
        if (!match) { return { message: 'Unable to update statistics: Match not found' }; }
        const teamIds = await this.teamService.ensureTeams(match);
        await this.teamStatsUpdateService.updateTeamStatsForMatch(match, teamIds);
        await this.playerStatsUpdateService.updatePlayerStatsForMatch(match);
        return { message: 'Succes' }
    }
}