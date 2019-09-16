import { Component, OnInit } from '@angular/core';
import { SharedState } from 'src/app/state/shared.state';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
})
export class PlayersPage implements OnInit {

  constructor(public state: SharedState, public groupService: GroupService) { }

  ngOnInit() {
  }

}
