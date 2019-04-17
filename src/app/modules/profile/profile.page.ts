import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Observable } from 'rxjs';
import { Player } from 'src/app/domain';
import { Router, ActivatedRoute } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public player$: Observable<Player>;
  private isNewUser = false;
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.queryParams.subscribe(params => {
      if (params.isNewUser) {
        this.isNewUser = true;
        this.showEnterNicknameAlert(true);
      } else {
        this.isNewUser = false;
      }
    });
  }

  ngOnInit() {
    this.authService.user$
      .pipe(filter(u => !!u))
      .pipe(take(1))
      .subscribe(u => {
        this.player$ = this.authService.playerDoc.valueChanges();
      });
  }
  public async editNickname(player: Player): Promise<void> {
    this.showEnterNicknameAlert(false, player.nickname);
  }

  public home() {
    this.router.navigateByUrl('/');
  }
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  public dismissProfile() {
    if (this.isNewUser) {
      this.home();
    } else {
      this.location.back();
    }
  }
  private async showEnterNicknameAlert(isNewUser: boolean, initialValue?: string) {
    const alert = await this.alertController.create({
      header: isNewUser ? 'Enter Nickname' : 'Edit Nickname',
      backdropDismiss: false,
      inputs: [
        {
          name: 'Nickname',
          value: initialValue,
          type: 'text',
          placeholder: 'enter a nickname'
        }
      ],
      buttons: isNewUser ? [
        {
          text: 'OK',
          handler: async (data) => {
            if (!data.Nickname || data.Nickname === '') {
              console.log(data);
              await this.authService.setNickname('AnonymousPlayer');
              return;
            }
            await this.authService.setNickname(data.Nickname);
          }
        }
      ] : [
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
}
