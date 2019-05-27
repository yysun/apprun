# 3rd Party Libraries

Using jQuery and jQuery plugins is not an anti-pattern. It is welcomed and encourages. AppRun embrace 3rd libraries and recommend you to use them in your AppRun application development.

## Rendered Callback

AppRun was designed to support 3rd party libraries in mind. The AppRun VDOM is resilient to allow other libraries to change to DOM. The AppRun architecture event life cycle has the _rendered_ callback functions, which allows other libraries in AppRun applications.

![](imgs/Figure_1-1.png)

## Bootstrap Admin Dashboard

The [bootstrap admin dashboard]() uses Bootstrap layout. It also use jQuery plugin DataTables and FullCalendar and chart.js and D3.

![admin dashboard](https://github.com/yysun/apprun-bootstrap/raw/master/screenshot.png)

## CoreUI Admin Template

Another example is using the [CoreUI for AppRun application](https://github.com/apprunjs/apprun-coreui).

![core ui](https://github.com/apprunjs/apprun-coreui/raw/master/screen.png)