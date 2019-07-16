export class Player {

    nickname: string;
    photoUrl: string;
    lastLogin: Date;
    defaultTableId: string;
    defaultGroupId: string;
    groupIds: string[] = [];
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    watchingTableIds: string[] = [];
    favouriteTableIds: string[] = [];
    fcmTokens?: { [token: string]: boolean };
}
