import {App} from '../app';
import {} from 'jasmine';

describe('app', () => {

  let app: App;
  beforeEach(() => app = new App());

  it ('should be able to cancel subscription', () => {
    let called = false;
    const fn = () => (called = true);
    const subscription: any = app.on('test', fn);
    subscription.unsubscribe();
    app.run('test');
    expect(called).toBeFalsy();
  });

  it ('should be able to return Observable<{}> from app.on', (done) => {
    let called = false;
    const subject:any = app.on('test');
    subject.debounceTime(200).subscribe(()=> called = true);
    app.run('test');
    expect(called).toBeFalsy();
    setTimeout(() => {
      expect(called).toBeTruthy();
      done();
    }, 250);
  });

  it ('should be able to return Subject<{}> from app.run', () => {
    let i=0, j=0
    const fn = () => {i++};
    const subscription: any = app.on('test', fn)
    const subject = app.run('test');
    subscription.unsubscribe();
    subject.subscribe(() => j++);
    subject.next();
    expect(i).toEqual(1);
    expect(j).toEqual(1);
  });

});