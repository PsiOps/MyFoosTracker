export class Player {
    id: string;
    nickname: string;
    photoUrl: string;
    lastLogin: Date;
    defaultGroupId: string;
    currentGroupId: string;
    currentGroupDefaultTableId: string;
    groupIds: string[] = [];
    playerSince: Date;
    favouritePlayerIds: string[] = [];
    defaultTableIdByGroup: {[groupId: string]: string };
    fcmTokens?: { [token: string]: boolean };
}
