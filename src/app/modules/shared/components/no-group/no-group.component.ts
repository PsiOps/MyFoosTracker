import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GroupService } from 'src/app/services/group.service';
import { GroupModalComponent } from '../group-modal/group-modal.component';
import { Player } from 'src/app/domain';

@Component({
  selector: 'app-no-group',
  templateUrl: './no-group.component.html',
  styleUrls: ['./no-group.component.scss'],
})
export class NoGroupComponent {

  public isLoading = true;
  @Input() player: Player;
  @Input() set groupId(groupId: string) {
    if (groupId === null) {
      // Only show the no group message (instead of a loader) if the incoming currentGroupId is null
      this.isLoading = false;
    }
  }

  constructor(
    private modalController: ModalController,
    private groupService: GroupService
  ) { }

  public async createGroup() {
    await this.groupService.addGroupToPlayer(this.player.id);
    const modal = await this.modalController.create({
      component: GroupModalComponent,
      componentProps: {
        isCreate: true,
      }
    });
    return await modal.present();
  }
}
