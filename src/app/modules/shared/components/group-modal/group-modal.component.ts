import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Group } from 'src/app/domain';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-group-modal',
  templateUrl: './group-modal.component.html',
  styleUrls: ['./group-modal.component.scss'],
})
export class GroupModalComponent implements OnInit {

  @Input() isCreate: boolean;
  @Input() group: Group;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    public groupService: GroupService) { }

  ngOnInit() {}

  public async archiveGroup(){
    const alert = await this.alertController.create({
      header: 'Confirm Archive Group',
      message: 'Are you sure you want to archive this group?',
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'YES, ARCHIVE THIS GROUP',
          handler: async () => {
            await this.groupService.archiveEditGroup();
          }
        }
      ]
    });

    await alert.present();
  }

  public async dismiss() {
    await this.modalController.dismiss();
  }
}
