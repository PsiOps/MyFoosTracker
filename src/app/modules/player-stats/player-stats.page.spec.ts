import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStatsPage } from './player-stats.page';

describe('PlayerStatsPage', () => {
  let component: PlayerStatsPage;
  let fixture: ComponentFixture<PlayerStatsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerStatsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerStatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
