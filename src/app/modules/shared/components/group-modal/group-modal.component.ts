import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-group-modal',
  templateUrl: './group-modal.component.html',
  styleUrls: ['./group-modal.component.scss'],
})
export class GroupModalComponent implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {}

  public dismiss(): void {
    this.modalController.dismiss();
  }
}
