export class TeamStats {
    public matchesWon = 0;
    public matchesLost = 0;
    public matchesTied = 0;
    public minutesPlayed = 0;
    public averageMatchDuration = 0;
    public goalsScored = 0;
    public goalsAgainst = 0;
}

export class TeamCombinationStats {
    constructor(public teamIds: string[]) {}
    public statsByTeamId: {[teamId: string]: TeamStats}
}
