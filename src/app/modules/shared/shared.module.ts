import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchComponent } from './components/match/match.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MatchComponent],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
  exports: [MatchComponent]
})
export class SharedModule { }
