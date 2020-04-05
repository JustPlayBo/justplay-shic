import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BdgMapComponent } from './bdg-map.component';

describe('BdgMapComponent', () => {
  let component: BdgMapComponent;
  let fixture: ComponentFixture<BdgMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BdgMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BdgMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
