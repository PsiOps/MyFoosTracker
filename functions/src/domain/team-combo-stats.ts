import { Stats } from './stats';

export class TeamComboStats {
    constructor(public teamIds: string[], public memberIds: string[]) {
        this.statsByTeamId = new Map<string, Stats>();
        teamIds.forEach(teamId => {
            this.statsByTeamId.set(teamId, new Stats());
        })
     }

     public statsByTeamId: Map<string, Stats>
}