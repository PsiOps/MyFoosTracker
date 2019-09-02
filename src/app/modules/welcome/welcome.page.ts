import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
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
    allowSlideNext: true
  };

  @ViewChild('nickname', {static: false}) myInput: IonInput;
  public nickName: string;

  @ViewChild('mySlider', {static: false}) private slides: IonSlides;

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 500);
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
    if (!this.nickName) { this.nickName = `Player${Math.floor(Math.random() * 1000000)}`; }
    await this.playerService.setNickname(this.nickName);
    await this.router.navigateByUrl('/');
  }
}
