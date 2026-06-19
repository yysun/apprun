import { App } from '../src/app';

describe('app events', () => {

  it('should be able to register(on) and trigger(run)', () => {
    const app = new App();
    let hi_called = false;
    app.on('hi', () => {
      hi_called = true;
    });
    app.run('hi');
    expect(hi_called).toBeTruthy();
  });

  it('should pass parameters to execution', () => {
    const app = new App();
    let hi_called = false;
    app.on('hi', (p1, p2, p3, p4) => {
      hi_called = true;
      expect(p1).toBe(1);
      expect(p2).toBe('xx');
      expect(p3).toBeNull;
      expect(p4).toEqual({a:1});
    });
    app.run('hi', 1, 'xx', null, {a: 1});
    expect(hi_called).toBeTruthy();
  });

  it('should take once option', () => {
    const app = new App();
    app.on('hi', (p1, p2, p3, p4) => { }, { once: true });
    app.run('hi', 1, 'xx', null, { a: 1 });
    expect(app['_events']['hi'].length).toBe(0);
  });

  it('should run once', () => {
    const app = new App();
    app.once('hi1', (p1, p2, p3, p4) => { });
    app.run('hi1', 1, 'xx', null, { a: 1 });
    expect(app['_events']['hi1'].length).toBe(0);
  });

  it('should run wildcard once handlers only once', () => {
    const app = new App();
    const fn = jasmine.createSpy('fn');
    spyOn(console, 'assert');

    app.once('user/*', fn);

    app.run('user/save', 1);
    app.run('user/save', 2);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, { once: true, event: 'user/save' });
    expect(app['_events']['user/*'].length).toBe(0);
    expect(app['_wildcard_events'].length).toBe(0);
  });

  it('should allow off inside run', () => {
    const app = new App();
    const eventName = 'test';
    const fn = (name: string, fn: any) => {
      app.off(name, fn);
    };

    expect(app['_events'][eventName]).toBeUndefined();
    app.on(eventName, fn);
    app.run(eventName, eventName, fn);
    expect(app['_events'][eventName].length).toBe(0);
  });

  it('should allow another on event inside run', () => {
    const app = new App();
    const eventName = 'test1';
    const fn = (name: string, fn: any) => {
      app.on(name, fn);
    };

    expect(app['_events'][eventName]).toBeUndefined();
    app.on(eventName, fn);
    app.run(eventName, eventName, fn);
    expect(app['_events'][eventName].length).toBe(2);
  });

  it('should allow new on event inside run', () => {
    const app = new App();
    const eventName = 'test1';
    const newEventName = 'test2';
    const fn = (name: string, fn: any) => {
      app.on(name, fn);
    };

    expect(app['_events'][eventName]).toBeUndefined();
    app.on(eventName, fn);
    app.run(eventName, newEventName, fn);
    expect(app['_events'][eventName].length).toBe(1);
    expect(app['_events'][newEventName].length).toBe(1);
  });

  it('should allow off', () => {
    const app = new App();
    const fn = (a) => {}
    app.on('hi', fn);
    app.off('hi', fn);
    expect(app['_events']['hi'].length).toBe(0);
  });

  it('should take delay option', (done) => {
    const app = new App();
    let i = 0;
    app.on('hi', () => { i++; }, {delay: 200});
    app.run('hi');
    app.run('hi');
    app.run('hi');
    expect(i).toBe(0);
    setTimeout(() => {
      expect(i).toBe(1);
      done();
    }, 250);
  });

  it('should isolate delay timers per subscription when options are shared', (done) => {
    const app = new App();
    const options = { delay: 50 };
    let a = 0;
    let b = 0;

    app.on('delay-a', () => { a++; }, options);
    app.on('delay-b', () => { b++; }, options);

    app.run('delay-a');
    app.run('delay-b');

    setTimeout(() => {
      expect(a).toBe(1);
      expect(b).toBe(1);
      expect((options as any)._t).toBeUndefined();
      done();
    }, 100);
  });

  it('should mix delay and non-delay events', (done) => {
    const app = new App();
    let i = 0;
    let j = 0;
    app.on('hi', () => { j++; });
    app.on('hi', () => { i++; }, {delay: 200});
    app.run('hi');
    app.run('hi');
    app.run('hi');
    expect(i).toBe(0);
    expect(j).toBe(3);
    setTimeout(() => {
      expect(i).toBe(1);
      done();
    }, 250);
  });

  it('should mix delay and once option', (done) => {
    const app = new App();
    spyOn(console, 'assert');
    let i = 0;
    app.on('hi', () => { i++; }, {once: true, delay: 200});
    app.run('hi');
    app.run('hi');
    app.run('hi');
    expect(i).toBe(0);
    setTimeout(() => {
      expect(i).toBe(1);
      expect(console.assert).toHaveBeenCalled();
      done();
    }, 250);
  });

  it('should remove only subscription that is once', () => {
    const app = new App();
    spyOn(console, 'assert');
    spyOn(console, 'log');
    app.on('hi', () => {
      console.log('hi');
    });
    app.on('hi', () => {}, {once: true});
    app.run('hi');
    app.run('hi');
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.assert).toHaveBeenCalled();
  });

  it('should run only once', () => {
    const app = new App();
    spyOn(console, 'assert');
    app.on('hi', (p1, p2, p3, p4) => {}, {once: true});
    app.run('hi', 1, 'xx', null, {a: 1});
    app.run('hi', 1, 'xx', null, {a: 1});
    expect(console.assert).toHaveBeenCalled();
  });

  it('should return the number of subscribers for a valid event name', () => {
    const app = new App();
    const hello = () => {};
    app.on('hello', hello);
    const subs: number = app.run('hello');
    expect(subs).toBe(1);
    app.off('hello', hello);
  });

  it('should return 0 subscribers for an invalid event name', () => {
    const app = new App();
    spyOn(console, 'assert');
    const subs: number = app.run('hiiiiiiii');
    expect(console.assert).toHaveBeenCalled();
    expect(subs).toBe(0);
  });

  it('should return undefined for an invalid event name', () => {
    const app = new App();
    app.on('hi', _ => 0);
    let has = app.find('hi');
    expect(has).not.toBeUndefined();
    has = app.find('hix');
    expect(has).toBeUndefined();
  });

  it('.runAsync should return promise', (done) => {
    const app = new App();
    app.on('0', _ => 10);
    app.on('0', n => n * 10);

    app.runAsync('0', 5).then(a => {
      expect(a[0]).toBe(10);
      expect(a[1]).toBe(50);
      done();
    });
  });

  it('event should should match pattern', (done) => {
    const app = new App();
    app.on('*', _ => 0);
    app.on('1*', _ => 10);
    app.on('12*', _ => 20);
    app.on('12', _ => 30);

    app.runAsync('12').then(a => {
      expect(a[0]).toBe(30);
      expect(a[1]).toBe(20);
      expect(a[2]).toBe(10);
      expect(a[3]).toBe(0);
      done();
    });
  });

  it('should keep a wildcard index separate from normal subscriptions', () => {
    const app = new App();
    const exact = () => 0;
    const wildcard = () => 1;

    app.on('phase2/exact', exact);
    app.on('phase2/*', wildcard);

    expect(app['_wildcard_events'].length).toBe(1);
    expect(app['_wildcard_events'][0].name).toBe('phase2/*');

    app.off('phase2/*', wildcard);

    expect(app['_wildcard_events'].length).toBe(0);
    expect(app.find('phase2/exact').length).toBe(1);
  });

  it('should publish run errors to the error event before falling back to console', () => {
    const app = new App();
    const error = new Error('run boom');
    const payloads = [];
    const consoleError = spyOn(console, 'error');

    app.on('error', payload => payloads.push(payload));
    app.on('boom', () => { throw error; });

    app.run('boom', 1);

    expect(payloads.length).toBe(1);
    expect(payloads[0].event).toBe('boom');
    expect(payloads[0].phase).toBe('run');
    expect(payloads[0].args).toEqual([1]);
    expect(payloads[0].error).toBe(error);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('should report run errors to console when no error subscriber exists', () => {
    const app = new App();
    const error = new Error('fallback boom');
    const consoleError = spyOn(console, 'error');

    app.on('boom', () => { throw error; });
    app.run('boom');

    expect(consoleError).toHaveBeenCalledWith(`Error in event handler for 'boom':`, error);
  });

  it('should publish delayed handler errors to the error event', (done) => {
    const app = new App();
    const error = new Error('delay boom');
    const payloads = [];
    spyOn(console, 'error');

    app.on('error', payload => payloads.push(payload));
    app.on('delay-boom', () => { throw error; }, { delay: 10 });
    app.run('delay-boom', 'x');

    setTimeout(() => {
      expect(payloads.length).toBe(1);
      expect(payloads[0].event).toBe('delay-boom');
      expect(payloads[0].phase).toBe('delay');
      expect(payloads[0].args).toEqual(['x']);
      expect(payloads[0].error).toBe(error);
      done();
    }, 30);
  });

  it('should publish runAsync rejections to the error event and preserve rejection', (done) => {
    const app = new App();
    const error = new Error('async boom');
    const payloads = [];
    spyOn(console, 'error');

    app.on('error', payload => payloads.push(payload));
    app.on('async-boom', () => Promise.reject(error));

    app.runAsync('async-boom', 2).catch(e => {
      expect(e).toBe(error);
      expect(payloads.length).toBe(1);
      expect(payloads[0].event).toBe('async-boom');
      expect(payloads[0].phase).toBe('runAsync');
      expect(payloads[0].args).toEqual([2]);
      expect(payloads[0].error).toBe(error);
      done();
    });
  });

  it('should pass event options as context', (done) => {
    const app = new App();
    app.on('0', (m, { n }) => n * m, { n: 10 });
    app.runAsync('0', 5).then(a => {
      expect(a[0]).toBe(50);
      done();
    });
  });

  it('should pass event name in the context', (done) => {
    const app = new App();
    app.on('0*', (_, { event }) => event);
    app.runAsync('000', 5).then(a => {
      expect(a[0]).toBe('000');
      done();
    });
  });

  it('should not create extra handlers', (done) => {
    const app = new App();
    app.on('0*', (_, { event }) => event);
    app.runAsync('000', 5).then(a => {
      expect(a[0]).toBe('000');
      done();
    });
    expect(app.find('000').length).toBe(0);
  });

});
