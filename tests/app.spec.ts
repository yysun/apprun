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
    expect(app['_events']['hi']).toBeUndefined();
  });

  it('should run once', () => {
    const app = new App();
    app.once('hi1', (p1, p2, p3, p4) => { });
    app.run('hi1', 1, 'xx', null, { a: 1 });
    expect(app['_events']['hi1']).toBeUndefined();
  });

  it('should allow off', () => {
    const app = new App();
    const fn = (a) => {}
    app.on('hi', fn);
    app.off('hi', fn);
    expect(app['_events']['hi']).toBeUndefined();
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
    app.on('hi', () => { i++; }, {one: true, delay: 200});
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

});