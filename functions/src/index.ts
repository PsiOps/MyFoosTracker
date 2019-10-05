import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();
import * as functions from 'firebase-functions';
import { MatchProcessingService } from './services/match-processing.service';
import { GroupArchivalProcessingService } from './services/group.archival-processing.service';
import { StatsRecalcService } from './services/stats-recalc.service';
import { Player } from './domain/player';
import { NotificationService } from './services/notification.service';
import { StatsUpdateService } from './services/stats-update.service';
import { StatsIncrementService } from './services/stats-increment.service';
import { TeamService } from './services/team.service';
import { Match } from './domain/match';
import { DocumentSnapshot } from '@google-cloud/firestore';
import { MatchService } from './services/match.service';

export const sendMatchInvitations = functions.https.onCall(async (data, context) => {
    const notificationService = new NotificationService(admin.messaging(), firestore);
    return await notificationService.sendMatchInvites(data.matchPath);
});

const matchService = new MatchService(firestore);
const teamService = new TeamService(firestore);
const groupArchivalProcessingService = new GroupArchivalProcessingService(firestore);
const statsIncrementService = new StatsIncrementService(teamService);
const statsUpdateService = new StatsUpdateService(firestore, teamService, statsIncrementService);

const matchProcessingService =
    new MatchProcessingService(matchService, statsIncrementService, statsUpdateService, teamService);

export const processMatch = functions.https.onCall(async (data, context) => {
    return await matchProcessingService.processMatch(data.matchPath);
});

export const processGroupArchival = functions.https.onCall(async (data, context) => {
    return await groupArchivalProcessingService.processGroupArchival(data.groupId);
});

export const recalculatePlayerStats = functions.https.onRequest(async (req, res) => {
    const statsRecalcService = new StatsRecalcService(statsUpdateService, statsIncrementService, teamService, firestore);
    const message = await statsRecalcService.recalculateStatistics();
    res.send(message);
});












export const removeUser = functions.https.onRequest(async (req, res) => {
    const userId = req.body.userId;
    const playerDoc = await firestore.doc(`/players/${userId}`);
    await playerDoc.delete();
    const playerStatsDoc = await firestore.doc(`/player-stats/${userId}`);
    await playerStatsDoc.delete();
    await admin.auth().deleteUser(userId);

    res.send('User removed');
});

const updateDocs = (docs: FirebaseFirestore.QuerySnapshot, updateObject: any) => {
    docs.forEach(doc => {
        doc.ref.update(updateObject).catch(err => console.log(err));
    })
}

export const updateData = functions.https.onRequest(async (req, res) => {

    // 22/07/2019
    const matchDocs = await firestore.collection('matches').get();
    updateDocs(matchDocs, { groupId: 'O6jNqHHthL4hzW5Kk52H'});

    // 19/7/2019
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, { 
    //     defaultTableId: fieldValue.delete(), 
    //     watchingTableIds: fieldValue.delete(),
    //     favouriteTableIds: fieldValue.delete(),
    //     defaultTableIdByGroup: {'O6jNqHHthL4hzW5Kk52H': 'iVk4Sl15wrAUqlQnyhoK'}
    // });
    
    // 16/7/2019
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, { defaultGroupId: 'O6jNqHHthL4hzW5Kk52H', groupIds: ['O6jNqHHthL4hzW5Kk52H']});

    // 16/4/2019
    // const playerDocs = await firestore.collection('players').get();
    // playerDocs.forEach(doc => {
    //     admin.auth().getUser(doc.id)
    //         .then(user => {
    //             const updateObject = { photoUrl: user.photoURL };
    //             doc.ref.update(updateObject).catch(err => console.log(err));
    //         })
    //         .catch(err => console.log(err));
    // })

    // 11/4/2019
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, { defaultTableId: fieldValue.delete(), watchingTableIds: ['iVk4Sl15wrAUqlQnyhoK', 'BtVwELRPwtmykmDlFy46'], favouriteTableIds: ['iVk4Sl15wrAUqlQnyhoK', 'BtVwELRPwtmykmDlFy46']});

    // 1/4/2019
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, {defaultTableRef: fieldValue.delete(), defaultTableId: 'HvPz1XQMtOGAxw0pq1dq', watchingTableIds: ['HvPz1XQMtOGAxw0pq1dq']});
    // const matchDocs = await firestore.collection('matches').get();
    // updateDocs(matchDocs, {tableRef: firestore.doc(`foosball-tables/HvPz1XQMtOGAxw0pq1dq`)})

    // Always
    res.send('done');
});
export const removeBadData = functions.https.onRequest(async (req, res) => {
    const nonMatchDocs = await firestore.collection('matches')
        .where('goalsTeamA', '==', 0)
        .where('goalsTeamB', '==', 0)
        .get();
    nonMatchDocs.forEach(doc => {
        doc.ref.delete().catch(err => console.log(err));
    })
    res.send('removed ' + nonMatchDocs.size);
});
export const testNotifications = functions.https.onRequest(async (req, res) => {
    const testPlayer = (await firestore.doc(`players/SrjvBNMltdRZ2jQsV8bd6kpwIm53`).get()).data() as Player;
    const payload: admin.messaging.MessagingPayload = {
        data: {
            data_type: "direct_message",
            title: "New Message from FoosTracker",
            message: "Yo yo wassup"
        },
        notification: {
            data_type: "direct_message",
            title: "New Message from FoosTracker",
            message: "Yo yo wassup"
        }
    };
    const result = [];
    for (const token in testPlayer.fcmTokens) {
        result.push(await admin.messaging().sendToDevice(token, payload))
    }
    res.send(result);
});

export const populateTeams = functions.https.onRequest(async (req, res) => {
    const allMatchDocs = await firestore.collection('matches').get();
    for(const doc of allMatchDocs.docs) {
        const match = doc.data() as Match;
        const teamIds = teamService.getTeamIds(match);
        for (const teamId of teamIds) {
            let teamDoc: DocumentSnapshot;
            try {
                teamDoc = await firestore.doc(`teams/${teamId}`).get();
            } catch (error) {
                console.log(error);
            }
            if(teamDoc.exists) { 
                console.log("Team Exists, continuing")
                continue;
            };
            console.log('Creating new Team Name');
            const teamName = teamService.getTeamName(teamId);
            console.log(`Created team name ${teamName}`);
            teamDoc.ref.set({ name: teamName }).catch(err => console.log(err));                       
        }
    }
    res.send('Awaited all the things');
});