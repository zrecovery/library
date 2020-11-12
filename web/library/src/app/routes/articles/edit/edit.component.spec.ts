import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesEditComponent } from './edit.component';

describe('EditComponent', () => {
  let component: ArticlesEditComponent;
  let fixture: ComponentFixture<ArticlesEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticlesEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticlesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
