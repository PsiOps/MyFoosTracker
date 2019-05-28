import { TeamStats } from './team-stats';

export class TeamComboStats {
    constructor(teamComboId: string) {
        this.members = teamComboId.split('-');
     }

     public members: string[];
     public teams: Map<string, TeamStats>
}