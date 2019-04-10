import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSelectDialogComponent } from './table-select-dialog.component';

describe('TableSelectDialogComponent', () => {
  let component: TableSelectDialogComponent;
  let fixture: ComponentFixture<TableSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
