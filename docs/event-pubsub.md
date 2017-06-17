# Event Publication and Subscription

At core, AppRun is an event publication and subscription system, which is also known as event emitter.

## Event Driven
Applications are often build with modules. Modules need to communicate each other.
With the help of a event system, modules are connected through an event system. They can
fire events each other without knowing who will be handling the events.

AppRun is a event system that provides two important functions : _app.run_ and _app.on_. _app.run_ fires events.
_app.on_ handles events. E.g. :

Module A provides an event handler _print_:
```
import app from 'apprun';
export () => app.on('print', e => console.log(e));
```
Module B fires the event _print_:
```
import app from 'apprun';
export () => app.run('print', {});
```
Main Module:
```
import a from './A';
import b from './B';
a();
b();
```
Module A and Module B only have to know the event system, not other modules, so they are only dependent
on the event system, not other modules. Therefore modules are decoupled.
Thus makes it easier to modify, extend and swap modules.


## Web Event

The web page programming is event driven. E.g. Event handler at global level:
```
document.body.addEventListener('click', e => { ... });
```
Or at element level:
```
element.addEventListener('click', e => { ... });
```
Or attach the event handler to the element:
```
<input onclick="...">
```

AppRun can connect web page events to application events then to application components.
```
document.body.addEventListener('click', e => app.run('click', e) );
element.addEventListener('click', e => app.run('click', e));
<input onclick="e => app.run('click', e)">
```
Now it's up to your application to continue executing.

## Routing

Interestingly, when connecting the _popstate_ event, a router can translate location hash to routing events.
```
window.addEventListener('popstate', () => route(location.hash));
function route (hash) {
  const [name, ...rest] = url.split('/');
  app.run(name, ...rest);
}
```

Application code can react to the routing event:
```
app.on('/', () => { ... });
app.on('#users', id => { ... });
app.on('#orders', _ => { ... });
```

## RxJS

AppRun started with an custom implementation of event system. Latest release, it
is changed to use [RxJS](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/howdoi/eventemitter.md)

```
on(name: string, fn?: Function, options?: any) : Observable<{}> | Subscription
run(name: string, ...args: any[]): Subject<{}>
```

AppRun events are RxJS compatible. They have same features as RxJS events,  e.g. they can be delayed, can be
cancelled and can be combined with other event streams.

With the event system in place, we can implement a nice [application architecture](concept.md).


