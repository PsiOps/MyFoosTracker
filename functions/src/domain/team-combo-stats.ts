import { Stats } from './stats';

export class TeamComboStats {
    constructor(public teamIds: string[], public memberIds: string[]) {
        teamIds.forEach(teamId => {
            this.statsByTeamId[teamId] = new Stats();
        })
     }

     public statsByTeamId: Map<string, Stats>
}