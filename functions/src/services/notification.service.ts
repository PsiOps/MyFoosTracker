import { Match } from '../domain/match';
import { Player } from '../domain/player';
import * as admin from 'firebase-admin';

export class NotificationService{
    constructor(private messaging: admin.messaging.Messaging, private firestore: FirebaseFirestore.Firestore) { }

    public async sendMatchInvites(matchPath: string): Promise<{ message: string }>{
        const match = (await this.firestore.doc(matchPath).get()).data() as Match;
        if (!match) { return { message: 'Unable to send invites: Match not found' }; }
        let sentIds = '';
        const organizer = (await this.firestore.doc(`players/${match.organizer}`).get()).data() as Player;
        for(const inviteeId of match.participants.filter(p => !match.organizer)){
            const participant = (await this.firestore.doc(`players/${inviteeId}`).get()).data() as Player;
            if(!participant.fcmTokens) continue;
            const payload: admin.messaging.MessagingPayload = {
                notification: {
                    data_type: "direct_message",
                    title: "FoosTracker: You have been invited to play foosball!",
                    message: `Greetings from FoosTracker! Dear ${participant.nickname}, you have been invited to play a match by ${organizer.nickname}`
                }
            };    
            for(const token in participant.fcmTokens){
                console.log(`Sending invitation to ${participant.nickname} with token ${token}`, participant);
                await this.messaging.sendToDevice(token, payload);
                sentIds += inviteeId;
            }        
        }
        return {message: `Sent Match Invite notification to ${sentIds}`};
    }
}