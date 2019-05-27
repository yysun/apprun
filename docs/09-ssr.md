# Server Side Rendering


AppRun is a front-end library for developing SPA. It also supports to render the SPAs on the server-side just like other frameworks. Furthermore, it also allows us to make existing traditional server-side rendered applications into SPAs. AppRun can make many existing applications build using the server-side model-view-control (MVC) architecture become SPAs easily.

## SPA to SSR

AppRun is isomorphic/universal. AppRun components can render on the client-side, as well as on the server-side using the AppRun server-side view engine.

Included in the [SSR AppRun application example](https://github.com/yysun/apprun-ssr), there are:

* The express.js server application (server.ts),
* The site layout (components/layout.tsx),
* The AppRun components (components/*.tsx)
* The client-side application (/public/spa.js).

You can run the application on @glitch, https://apprun-ssr.glitch.me


## SSR to SPA

Please read this post, [Making ASP.NET Core MVC Apps into Single Page Apps using AppRun](https://medium.com/@yiyisun/making-asp-net-core-mvc-apps-into-single-page-apps-using-apprun-e1ae4dbc60da)

![](https://cdn-images-1.medium.com/max/1600/1*1ZtgK-R4YDb8P4ahLq60Hg.png)