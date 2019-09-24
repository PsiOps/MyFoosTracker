import { Component } from '@angular/core';
import { SharedState } from '../../state/shared.state';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage {

  constructor(public state: SharedState, public groupService: GroupService) { }

  public refresh($event: any) {
    setTimeout(() => $event.target.complete(), 500);
  }
}
