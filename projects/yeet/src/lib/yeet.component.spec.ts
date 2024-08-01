import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YeetComponent } from './yeet.component';

describe('YeetComponent', () => {
  let component: YeetComponent;
  let fixture: ComponentFixture<YeetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YeetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YeetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
