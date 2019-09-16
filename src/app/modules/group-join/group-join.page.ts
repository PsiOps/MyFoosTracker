import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';
import { SharedState } from 'src/app/state/shared.state';
import { ToastController } from '@ionic/angular';

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
    public state: SharedState,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(paramMap => {
      const groupIdToJoin = paramMap.get('groupId');
      this.groupService.setJoinGroupId(groupIdToJoin);
    });
  }

  public async joinPlayerToGroup(playerId: string, groupId: string) {
    await this.groupService.joinPlayerToGroup(playerId, groupId);
    const toast = await this.toastController.create(
      {
        message: 'Group joined!',
        animated: true,
        duration: 650,
        position: 'bottom',
        color: 'success'

      });
    toast.onDidDismiss()
      .then(() => this.router.navigateByUrl('/'));
    toast.present();
  }
  public dismiss() {
    this.router.navigateByUrl('/');
  }
}
