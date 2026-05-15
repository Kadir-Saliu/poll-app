import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSurvey } from './single-survey';

describe('SingleSurvey', () => {
  let component: SingleSurvey;
  let fixture: ComponentFixture<SingleSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSurvey],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
