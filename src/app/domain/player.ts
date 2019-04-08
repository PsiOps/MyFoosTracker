export class Player {
    nickname: string;
    lastLogin: Date;
    defaultTableId: string;
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    watchingTableIds: string[] = [];
    favouriteTableIds: string[] = [];
    fcmTokens?: { [token: string]: boolean };
}
