# Routing

Routing in AppRun is event-driven. Handling routing using events is straightforward.

## Routing Event

AppRun router detects the _hash_ changes in URL (by listening to the window's _onpopstate_ event) and publishes the AppRun events using the _hash_ as the event name. Components subscribe to the routing events.

E.g., when URL in the browser address bar becomes http://..../#counter, it triggers the _#counter_ event. The _Counter_ component reacts to the _#counter_ and renders itself to the screen.

That's it. There is no other code for routing.

## Unhandled Routes

When the AppRun router triggers an AppRun event with no listener for the route, the router will automatically generate a ROUTER_404_EVENT AppRun event giving the application a chance to degrade gracefully by, perhaps, displaying a 404 page. To bind to this event, here are a few examples of things you can do:

```javascript
import app, { Component, ROUTER_404_EVENT } from 'apprun';

// Generate an error message when there's no handler for a URL.
app.on(ROUTER_404_EVENT, (url, ..._rest) => console.error('No event handler for', url));

// Alternatively, create a component that will display a message.
class NoRouteComponent extends Component {
  state = {};

  view = (state) => {
    return <><h1>PAGE NOT FOUND! WE SUCK!</h1></>
  }

  // Handle the "no route found" events with this component
  update = {
    [ROUTER_404_EVENT]: state => state
  }
}

new NoRouteComponent().mount( on some element );
```

## Pretty Links

If you would prefer to use pretty links (i.e., non-hash links) and have HTML5 browser history, then you can implement a new router yourself or use the pretty router from the [apprun-router](https://github.com/phBalance/apprun-router) package. This router also handles unknown routes via the ROUTER_404_EVENT and has a few other goodies to make life easier.

## Replacing Default Router

Replacing AppRun's default router couldn't be easier. Just overwrite app.route, and you're off to the races. You'll also want to bind to the _popstate_ events and trigger the first URL event (via the DOMContentLoaded event handler in the code example below):

```javascript
// A simplistic but not great router.
function newRouter(url: string) {
  app.run(url);
  app.run(ROUTER_EVENT, url);
}

// Kick off the first URL event when the DOM is loaded.
document.addEventListener("DOMContentLoaded", () => {
  window.onpopstate = app["route"](location.pathname, true);
  newRouter(location.pathname);
});

app["route"] = newRouter;
```