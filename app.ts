import {Subject} from 'rxjs/Subject';
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

  on(name: string, fn: Function, options: any = {}) {
    if (options.debug) console.debug('on: ' + name);
    this.subjects[name] || (this.subjects[name] = new Subject);
    let subject = this.subjects[name] as Observable<{}>;
    if (options.delay) subject = subject.debounceTime(options.delay);
    if (options.once) subject = subject.first();
    return subject.subscribe((args) => {
      if (options.debug) console.debug('run: ' + name);
      fn.apply(this, args);
    });
  }

  run(name: string, ...args: any[]) {
    const subject = this.subjects[name];
    console.assert(!!subject, 'No subscriber for event: ' + name);
    this.subjects[name].next(args);
  }
}
export default new App();