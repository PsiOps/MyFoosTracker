import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableManageComponent } from './table-manage.component';

describe('TableManageComponent', () => {
  let component: TableManageComponent;
  let fixture: ComponentFixture<TableManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
