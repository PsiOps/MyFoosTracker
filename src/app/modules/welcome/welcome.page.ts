import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IonInput, ModalController, IonSlides } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlayerService } from 'src/app/services/player.service';
import { GroupService } from 'src/app/services/group.service';
import { GroupModalComponent } from '../shared/components/group-modal/group-modal.component';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit, AfterViewInit {
  constructor(
    private playerService: PlayerService,
    private groupService: GroupService,
    private router: Router,
    private modalController: ModalController
    ) {}
  slideOpts = {
    zoom: false,
    centeredSlides: true,
    spaceBetween: 0,
    slidesPerView: 1,
    allowTouchMove: false
  };

  @ViewChild('nickname', {static: false}) nicknameInput: IonInput;
  @ViewChild('mySlider', {static: false}) private slides: IonSlides;

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.nicknameInput.setFocus();
    }, 500);
  }

  public async submitName() {
    this.playerService.setNickname(this.nicknameInput.value)
      .then(() => this.slides.slideNext());
  }

  // Temp for Snappet FoosTracker
  public async joinSnappetGroup() {
    this.playerService.setNickname(this.nicknameInput.value)
      .then(() => this.groupService.joinPlayerToGroup(this.playerService.playerDocRef.id, 'O6jNqHHthL4hzW5Kk52H'))
      .then(() => this.letsGo());
  }

  public async createGroup() {
    await this.groupService.addGroupToPlayer(this.playerService.playerDocRef.id);
    const modal = await this.modalController.create({
      component: GroupModalComponent,
      componentProps: {
        isCreate: true,
      }
    });
    modal.onDidDismiss().then(() => this.slides.slideNext());
    return await modal.present();
  }

  public async letsGo() {
    await this.router.navigateByUrl('/');
  }
}
