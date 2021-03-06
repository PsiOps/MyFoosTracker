import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Group, Player, Table } from '../domain';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, filter, switchMap } from 'rxjs/operators';
import { SharedState } from '../state/shared.state';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { CloudFunctionsService } from './cloud-functions.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  public currentGroup$: BehaviorSubject<Group> = new BehaviorSubject(null);
  private currentGroupDoc: AngularFirestoreDocument<Group>;
  public currentGroupMembers$: BehaviorSubject<Player[]> = new BehaviorSubject([]);

  public currentGroupTables$: BehaviorSubject<Table[]> = new BehaviorSubject([]);
  private currentGroupTablesCollection: AngularFirestoreCollection<Table>;

  public editGroup$: BehaviorSubject<Group> = new BehaviorSubject(null);
  private editGroupDoc: AngularFirestoreDocument<Group>;
  public editGroupMembers$: BehaviorSubject<Player[]> = new BehaviorSubject([]);
  public editGroupTables$: BehaviorSubject<Table[]> = new BehaviorSubject([]);
  public editGroupTablesCollection: AngularFirestoreCollection<Table>;

  public joinGroup$: BehaviorSubject<Group> = new BehaviorSubject(null);
  private joinGroupDoc: AngularFirestoreDocument<Group>;

  constructor(
    private afs: AngularFirestore,
    private state: SharedState,
    private cloudFunctionsService: CloudFunctionsService
  ) {
    const currentGroupIdObs$ = this.state.player$
      .pipe(filter(player => !!player))
      .pipe(map(player => player.defaultGroupId));

    currentGroupIdObs$.subscribe(groupId => this.state.currentGroupId$.next(groupId));

    const currentGroupObs$ = this.state.currentGroupId$
      .pipe(map(groupId => this.currentGroupDoc = this.afs.doc<Group>(`groups/${groupId}`)))
      .pipe(switchMap(doc => doc
        .valueChanges()
        .pipe(map(group => {
          if (group) {
            group.id = doc.ref.id;
          }
          return group;
        }))
      ));
    currentGroupObs$.subscribe(group => this.currentGroup$.next(group));

    const currentGroupMembersObs$ = this.currentGroup$
      .pipe(filter(group => !!group))
      .pipe(switchMap(group =>
        this.afs.collection<Player>('players',
          ref => ref.where('groupIds', 'array-contains', group.id)).snapshotChanges()
          .pipe(map(docs => docs.map(doc => {
            const player = doc.payload.doc.data();
            player.id = doc.payload.doc.ref.id;
            return player;
          })))
      ));

    currentGroupMembersObs$.subscribe(players => this.currentGroupMembers$.next(players));

    const currentGroupTablesObs$ = this.currentGroup$
      .pipe(filter(group => group !== null))
      .pipe(map(group => this.currentGroupTablesCollection = this.currentGroupDoc.collection<Table>('tables')))
      .pipe(switchMap(collection => collection.snapshotChanges()
        .pipe(map(docs => docs.map(doc => {
          const table = doc.payload.doc.data();
          table.id = doc.payload.doc.ref.id;
          return table;
        })))));
    currentGroupTablesObs$.subscribe(tables => this.currentGroupTables$.next(tables));

    const editGroupObs$ = this.state.editGroupId$
      .pipe(filter(groupId => !!groupId))
      .pipe(map(groupId => this.editGroupDoc = this.afs.doc<Group>(`groups/${groupId}`)))
      .pipe(switchMap(doc => doc
        .valueChanges()
        .pipe(map(group => {
          group.id = doc.ref.id;
          return group;
        }))
      ));
    editGroupObs$.subscribe(editGroup => this.editGroup$.next(editGroup));

    const joinGroupObs$ = this.state.joinGroupId$
      .pipe(filter(groupId => !!groupId))
      .pipe(map(groupId => this.joinGroupDoc = this.afs.doc<Group>(`groups/${groupId}`)))
      .pipe(switchMap(doc => doc
        .valueChanges()
        .pipe(map(group => {
          group.id = doc.ref.id;
          return group;
        }))
      ));
    joinGroupObs$.subscribe(joinGroup => this.joinGroup$.next(joinGroup));

    const editGroupMembersObs$ = this.state.editGroupId$
      .pipe(filter(groupId => !!groupId))
      .pipe(switchMap(groupId =>
        this.afs.collection<Player>('players',
          ref => ref.where('groupIds', 'array-contains', groupId)).snapshotChanges()
          .pipe(map(docs => docs.map(doc => {
            const player = doc.payload.doc.data();
            player.id = doc.payload.doc.ref.id;
            return player;
          })))
      ));
    editGroupMembersObs$.subscribe(players => this.editGroupMembers$.next(players));

    const editGroupTablesObs$ = this.state.editGroupId$
      .pipe(filter(groupId => !!groupId))
      .pipe(map(groupId => this.editGroupTablesCollection = this.afs.collection<Table>(`groups/${groupId}/tables`)))
      .pipe(switchMap(collection => collection.snapshotChanges()
        .pipe(map(docs => docs.map(doc => {
          const table = doc.payload.doc.data();
          table.id = doc.payload.doc.ref.id;
          return table;
        })))));
    editGroupTablesObs$.subscribe(tables => this.editGroupTables$.next(tables));

    const canCreateGroupObs$ = this.state.player$
      .pipe(filter(player => !!player))
      .pipe(switchMap(player => {
        const adminGroups = this.afs.collection<Group>('groups', ref => ref
          .where('admins', 'array-contains', player.id)
          .where('isArchived', '==', false));
        return adminGroups.valueChanges()
          .pipe(map(groups => groups.length < 1));
      }));
    canCreateGroupObs$.subscribe(canCreate => this.state.canCreateGroup$.next(canCreate));
  }

  public async addGroupToPlayer(playerId: string): Promise<void> {
    const groupDocRef = await this.afs.collection('groups').add({ name: 'My Group', admins: [playerId] });
    await this.afs.collection(`groups/${groupDocRef.id}/tables`).add({ name: 'Table1' });
    const payload: firebase.firestore.UpdateData = {
      groupIds: firebase.firestore.FieldValue.arrayUnion(groupDocRef.id),
      defaultGroupId: groupDocRef.id
    };

    await this.afs.doc(`players/${playerId}`).update(payload);
    this.setEditGroupId(groupDocRef.id);
  }

  public async joinPlayerToGroup(playerId: string, groupId: string): Promise<void> {
    const payload: firebase.firestore.UpdateData = {
      groupIds: firebase.firestore.FieldValue.arrayUnion(groupId),
      defaultGroupId: groupId
    };

    await this.afs.doc(`players/${playerId}`).update(payload);
  }

  public setEditGroupId(groupId: string) {
    this.state.editGroupId$.next(groupId);
  }

  public async setCurrentGroupId(playerId: string, groupId: string) {
    const payload: firebase.firestore.UpdateData = {
      defaultGroupId: groupId
    };
    await this.afs.doc(`players/${playerId}`).update(payload);
  }

  public setJoinGroupId(groupId: string) {
    this.state.joinGroupId$.next(groupId);
  }

  public isGroupAdmin(player: Player, group: Group): boolean {
    return group.admins && group.admins.includes(player.id);
  }

  public setGroupName(name: string) {
    this.editGroupDoc.update({ name: name });
  }

  public async archiveEditGroup(player: Player, group: Group) {
    this.editGroupDoc.update({ isArchived: true });
    const payload: firebase.firestore.UpdateData = {
      defaultGroupId: null
    };
    await this.afs.doc(`players/${player.id}`).update(payload);

    this.cloudFunctionsService.processGroupArchival(group.id);
  }
}
