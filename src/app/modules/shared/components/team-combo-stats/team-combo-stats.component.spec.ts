import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamComboStatsComponent } from './team-combo-stats.component';

describe('TeamComboStatsComponent', () => {
  let component: TeamComboStatsComponent;
  let fixture: ComponentFixture<TeamComboStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamComboStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamComboStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
