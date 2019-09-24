import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player, Match } from '../domain';

@Injectable({
    providedIn: 'root'
})
export class SharedState {
    public currentGroupId$: BehaviorSubject<string> = new BehaviorSubject(null);
    public editGroupId$: BehaviorSubject<string> = new BehaviorSubject(null);
    public joinGroupId$: BehaviorSubject<string> = new BehaviorSubject(null);
    public player$: BehaviorSubject<Player> = new BehaviorSubject(null);
    public canCreateGroup$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    public matchesInProgress$: BehaviorSubject<Match[]> = new BehaviorSubject([]);
}
