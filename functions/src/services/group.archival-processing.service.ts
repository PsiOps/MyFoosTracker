export class GroupArchivalProcessingService {

    constructor(private firestore: FirebaseFirestore.Firestore) { }

    public async processGroupArchival(groupId: string): Promise<{ message: string }> {

        const batch = this.firestore.batch();
        const querySnapshot = await this.firestore.collection('players').where('defaultGroupId', '==', groupId).get();
        querySnapshot.docs.forEach(qds => batch.update(qds.ref, { defaultGroupId: null }));
        batch.commit()
            .then(r => console.log(r))
            .catch(err => console.log('error', err));

        return { message: 'Succes' }
    }
}