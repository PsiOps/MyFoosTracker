import * as admin from 'firebase-admin';
const firebaseAdmin = admin.initializeApp();
const firestore = firebaseAdmin.firestore();
import * as functions from 'firebase-functions';
import { StatsUpdateService } from './services/stats-update.service';
import { StatsRecalcService } from './services/stats-recalc.service';
import { Player } from './domain/player';
import { NotificationService } from './services/notification.service';

const statsUpdateService = new StatsUpdateService(firestore);

const updateDocs = (docs: FirebaseFirestore.QuerySnapshot, updateObject: any) => {
    docs.forEach(doc => {
        doc.ref.update(updateObject).catch(err => console.log(err));
    })
}

export const updatePlayerStats = functions.https.onCall(async (data, context) => {
    return await statsUpdateService.updateStatsForMatch(data.matchPath);
});
export const sendMatchInvitations = functions.https.onCall(async (data, context) => {
    const notificationService = new NotificationService(admin.messaging(), firestore);
    return await notificationService.sendMatchInvites(data.matchPath);
});
export const recalculatePlayerStats = functions.https.onRequest(async (req, res) => {
    console.log('Starting recalculation');
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
    const message = await statsRecalcService.recalculateStatistics();
    res.send(message);
});
export const markForRecalculation = functions.https.onRequest(async (req, res) => {
    const statsRecalcService = new StatsRecalcService(statsUpdateService, firestore);
    const message = await statsRecalcService.markForRecalculation();
    res.send(message);
});
export const updateData = functions.https.onRequest(async (req, res) => {
    // const fieldValue = admin.firestore.FieldValue;
    // const playerDocs = await firestore.collection('players').get();
    // updateDocs(playerDocs, {defaultTableRef: fieldValue.delete(), defaultTableId: 'HvPz1XQMtOGAxw0pq1dq', watchingTableIds: ['HvPz1XQMtOGAxw0pq1dq']});
    // const matchDocs = await firestore.collection('matches').get();
    // updateDocs(matchDocs, {tableRef: firestore.doc(`foosball-tables/HvPz1XQMtOGAxw0pq1dq`)})
    res.send('done');
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
    const result =[];
    for(const token in testPlayer.fcmTokens){
        result.push(await admin.messaging().sendToDevice(token, payload))
    }
    res.send(result);
});