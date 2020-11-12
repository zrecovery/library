import { Article } from './article';

describe('Article', () => {
  it('should create an instance', () => {
    expect(new Article("","",0,"test","")).toBeTruthy();
  });
});
