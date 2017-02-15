import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/debounceTime';

export class App {

  private subjects = {}
  public start;
  public h;
  public createElement;

  constructor() {
  }

  on(name: string, fn?: Function, options?: any) : Observable<{}> | Subscription {
    this.subjects[name] || (this.subjects[name] = new Subject);
    let subject = this.subjects[name] as Observable<{}>;
    if (!fn) return subject;
    options = options || {};
    if (options.debug) console.debug('on: ' + name);
    if (options.delay) subject = subject.debounceTime(options.delay);
    if (options.once) subject = subject.first();
    return subject.subscribe((args) => {
      if (options.debug) console.debug('run: ' + name);
      fn.apply(this, args);
    });
  }

  run(name: string, ...args: any[]): Subject<{}> {
    const subject = this.subjects[name];
    console.assert(!!subject, 'No subscriber for event: ' + name);
    this.subjects[name].next(args);
    return this.subjects[name] as Subject<{}>;
  }
}
export default new App();