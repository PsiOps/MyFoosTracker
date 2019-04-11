import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchComponent } from './components/match/match.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { TableManageComponent } from './components/table-manage/table-manage.component';
import { TableSearchPipe } from './pipes/table-search.pipe';

@NgModule({
  declarations: [
    MatchComponent,
    HeaderComponent,
    TableManageComponent,
    TableSearchPipe
  ],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ],
  exports: [
    MatchComponent,
    HeaderComponent,
    TableManageComponent,
    TableSearchPipe
  ],
  entryComponents: [TableManageComponent]
})
export class SharedModule { }
