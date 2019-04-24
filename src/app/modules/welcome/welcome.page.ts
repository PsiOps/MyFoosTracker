import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit, AfterViewInit {
  constructor(
    private authService: AuthenticationService,
    private router: Router
    ) {}
  slideOpts = {
    zoom: false,
    centeredSlides: true,
    spaceBetween: 0,
    slidesPerView: 1,
    allowSlideNext: true
  };

  @ViewChild('nickname') myInput: IonInput;
  public nickName: string;

  ngOnInit() { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 500);
  }

  public letsGo() {
    if (!this.nickName) { this.nickName = 'Anonymous'; }
    this.authService.setNickname(this.nickName);
    this.router.navigateByUrl('/');
  }
}
