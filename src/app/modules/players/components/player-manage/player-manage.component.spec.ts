import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerManageComponent } from './player-manage.component';

describe('PlayerManageComponent', () => {
  let component: PlayerManageComponent;
  let fixture: ComponentFixture<PlayerManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
