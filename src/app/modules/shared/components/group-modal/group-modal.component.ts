import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController, Platform, ToastController } from '@ionic/angular';
import { Group } from 'src/app/domain';
import { GroupService } from 'src/app/services/group.service';
import { DynamicLinkService } from 'src/app/services/dynamic-link.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ClipboardService } from 'src/app/services/clipboard.service';

@Component({
  selector: 'app-group-modal',
  templateUrl: './group-modal.component.html',
  styleUrls: ['./group-modal.component.scss'],
})
export class GroupModalComponent implements OnInit {

  @Input() isCreate: boolean;
  @Input() group: Group;

  private subject = 'You have been invited to join a FoosTracker group';

  constructor(
    public platform: Platform,
    private modalController: ModalController,
    private alertController: AlertController,
    public groupService: GroupService,
    public dynamicLinkService: DynamicLinkService,
    private socialSharing: SocialSharing,
    private clipboardService: ClipboardService,
    private toastController: ToastController) { }

  ngOnInit() { }

  public async shareJoinGroupLink(groupName: string, link: string) {
    if (this.platform.is('cordova')) {
      this.socialSharing.share(
        this.getGroupJoinMessage(groupName),
        this.subject,
        null,
        link
      );
    } else {
      if (window.navigator && window.navigator['share']) {
        window.navigator['share']({
          title: this.subject,
          text: this.getGroupJoinMessage(groupName),
          url: link,
        })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
      } else {
        this.clipboardService.copyToClipboard(`${this.subject}
${this.getGroupJoinMessage(groupName)}
${link}`);
        const toast = await this.toastController.create(
          {
            message: 'Group Join Message copied to clipboard!',
            animated: true,
            duration: 1200,
            position: 'middle',
            color: 'success'
          });
        toast.present();
      }
    }

  }

  public async archiveGroup() {
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

  private getGroupJoinMessage(groupName: string): string {
    return `Click the link to join the ${groupName} Foostracker group!`;
  }
}
