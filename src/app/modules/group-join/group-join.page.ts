import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { SharedState } from 'src/app/state/shared.state';

@Component({
  selector: 'app-group-join',
  templateUrl: './group-join.page.html',
  styleUrls: ['./group-join.page.scss'],
})
export class GroupJoinPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public groupService: GroupService,
    public state: SharedState
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(paramMap => {
      const groupIdToJoin = paramMap.get('groupId');
      this.groupService.setJoinGroupId(groupIdToJoin);
    });
  }

  public async joinPlayerToGroup(playerId: string, groupId: string) {
    await this.groupService.joinPlayerToGroup(playerId, groupId);
    this.router.navigateByUrl('/');
  }
  public dismiss() {
    this.router.navigateByUrl('/');
  }
}
