import { Component, OnInit } from '@angular/core';
import { Player } from 'src/app/domain';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { PlayerService } from 'src/app/services/player.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupModalComponent } from '../shared/components/group-modal/group-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  constructor(
    private authService: AuthenticationService,
    public playerService: PlayerService,
    public groupService: GroupService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private location: Location
  ) { }

  public async editNickname(player: Player): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Edit Nickname',
      backdropDismiss: false,
      inputs: [
        {
          name: 'Nickname',
          value: player.nickname,
          type: 'text',
          placeholder: 'enter a nickname'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'OK',
          handler: async (data) => {
            if (!data.Nickname || data.Nickname === '') { return; }
            await this.playerService.setNickname(data.Nickname);
          }
        }
      ]
    });

    await alert.present();
  }

  public async createGroup() {
    const modal = await this.modalController.create({
      component: GroupModalComponent
    });
    return await modal.present();
 }


  // Needed because this page does not used the shared header component
  public home() {
    this.router.navigateByUrl('/');
  }
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  public dismissProfile() {
    this.location.back();
  }
}
