import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../domain';

@Injectable({
    providedIn: 'root'
})
export class SharedState {
    public currentGroupId$: BehaviorSubject<string> = new BehaviorSubject(null);
    public editGroupId$: BehaviorSubject<string> = new BehaviorSubject(null);
    public player$: BehaviorSubject<Player> = new BehaviorSubject(null);
}