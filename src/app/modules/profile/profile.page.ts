import { Component } from '@angular/core';
import { Player, Group } from 'src/app/domain';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Location } from '@angular/common';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupModalComponent } from '../shared/components/group-modal/group-modal.component';
import { SharedState } from 'src/app/state/shared.state';
import { PlayerService } from 'src/app/services/player.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  public playerGroups$: Observable<Group[]> = this.playerService.playerGroups$
    .pipe(map(groups => groups.filter(group => !group.isArchived)));

  constructor(
    private authService: AuthenticationService,
    public state: SharedState,
    private playerService: PlayerService,
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

  public async createGroup(player: Player) {
    await this.groupService.addGroupToPlayer(player.id);
    const modal = await this.modalController.create({
      component: GroupModalComponent,
      componentProps: {
        isCreate: true,
      }
    });
    return await modal.present();
  }

  public changeCurrentGroup(player: Player, group: Group, event: Event) {
    event.stopPropagation();
    this.groupService.setCurrentGroupId(player.id, group.id);
  }

  public async editGroup(group: Group) {
    await this.groupService.setEditGroupId(group.id);
    const modal = await this.modalController.create({
      component: GroupModalComponent,
      componentProps: {
        isCreate: false,
      }
    });
    return await modal.present();
  }

  // Needed because this page does not used the shared header component
  public home() {
    this.router.navigateByUrl('/');
  }
  public async logout() {
    await this.authService.logout();
    setTimeout(() => this.router.navigateByUrl('/'), 500);
  }

  public dismissProfile() {
    this.location.back();
  }
}
