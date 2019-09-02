import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GroupService } from 'src/app/services/group.service';
import { GroupModalComponent } from '../group-modal/group-modal.component';
import { Player } from 'src/app/domain';

@Component({
  selector: 'app-no-group',
  templateUrl: './no-group.component.html',
  styleUrls: ['./no-group.component.scss'],
})
export class NoGroupComponent implements OnInit {

  @Input() player: Player;

  constructor(
    private modalController: ModalController,
    private groupService: GroupService
  ) { }

  ngOnInit() { }

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
