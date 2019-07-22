import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Player } from 'src/app/domain';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { PlayerService } from 'src/app/services/player.service';
import { AuthenticationService } from 'src/app/auth/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  public player$: Observable<Player>;
  constructor(
    private authService: AuthenticationService,
    private playerService: PlayerService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {  }

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
