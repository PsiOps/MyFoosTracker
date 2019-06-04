import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();
import * as functions from 'firebase-functions';
import { MatchProcessingService } from './services/match-processing.service';
import { StatsRecalcService } from './services/stats-recalc.service';
import { Player } from './domain/player';
import { NotificationService } from './services/notification.service';
import { StatsUpdateService } from './services/stats-update.service';
import { StatsIncrementService } from './services/stats-increment.service';
import { TeamService } from './services/team.service';

export const sendMatchInvitations = functions.https.onCall(async (data, context) => {
    const notificationService = new NotificationService(admin.messaging(), firestore);
    return await notificationService.sendMatchInvites(data.matchPath);
});

const teamService = new TeamService();
const statsIncrementService = new StatsIncrementService(teamService);
const statsUpdateService = new StatsUpdateService(firestore, teamService, statsIncrementService);

const matchProcessingService = 
    new MatchProcessingService(firestore, statsIncrementService, statsUpdateService);

export const processMatch = functions.https.onCall(async (data, context) => {
    return await matchProcessingService.processMatch(data.matchPath);
});

export const markForRecalculation = functions.https.onRequest(async (req, res) => {
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
    const message = await statsRecalcService.markForRecalculation();
    res.send(message);
});

export const recalculatePlayerStats = functions.https.onRequest(async (req, res) => {
    console.log('Starting recalculation');
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
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
// const updateDocs = (docs: FirebaseFirestore.QuerySnapshot, updateObject: any) => {
//     docs.forEach(doc => {
//         doc.ref.update(updateObject).catch(err => console.log(err));
//     })
// }
export const updateData = functions.https.onRequest(async (req, res) => {
    // 1/4/2019
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, {defaultTableRef: fieldValue.delete(), defaultTableId: 'HvPz1XQMtOGAxw0pq1dq', watchingTableIds: ['HvPz1XQMtOGAxw0pq1dq']});
    // const matchDocs = await firestore.collection('matches').get();
    // updateDocs(matchDocs, {tableRef: firestore.doc(`foosball-tables/HvPz1XQMtOGAxw0pq1dq`)})

    // 11/4/2019
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, { defaultTableId: fieldValue.delete(), watchingTableIds: ['iVk4Sl15wrAUqlQnyhoK', 'BtVwELRPwtmykmDlFy46'], favouriteTableIds: ['iVk4Sl15wrAUqlQnyhoK', 'BtVwELRPwtmykmDlFy46']});

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