import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Observable } from 'rxjs';
import { Player } from 'src/app/domain';
import { Router } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public player$: Observable<Player>;
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController,
    private location: Location,
    public groupService: GroupService
  ) {  }

  ngOnInit() {
    this.player$ = this.authService.playerDoc.valueChanges();
  }
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
            await this.authService.setNickname(data.Nickname);
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
