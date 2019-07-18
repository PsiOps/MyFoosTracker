export class Player {

    nickname: string;
    photoUrl: string;
    lastLogin: Date;
    defaultTableId: string; // Deprecated, should be removed
    defaultGroupId: string;
    groupIds: string[] = [];
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    defaultTableIdByGroup: {[groupId: string]: string };
    fcmTokens?: { [token: string]: boolean };
}
