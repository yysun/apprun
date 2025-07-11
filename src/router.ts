/**
 * AppRun Router Implementation
 * 
 * This file provides URL routing capabilities:
 * 1. Hash-based routing (#/path)
 * 2. Path-based routing (/path) 
 * 3. Event-based navigation
 * 
 * Features:
 * - Automatic route event firing
 * - 404 handling via ROUTER_404_EVENT
 * - History API integration
 * - Route parameter parsing
 * 
 * Usage:
 * ```ts
 * // Handle routes
 * app.on('#/home', () => // Show home page);
 * app.on('#/users/:id', (id) => // Show user profile);
 * 
 * // Navigate programmatically
 * app.run('route', '#/home');
 * ```
 */

import app from './app';

export type Route = (url: string, ...args: any[]) => any;

export const ROUTER_EVENT: string = '//';
export const ROUTER_404_EVENT: string = '///';
export const route: Route = (url: string) => {
  if (app['lastUrl'] === url) return; // Prevent duplicate routing
  app['lastUrl'] = url;
  if (!url) url = '#';
  if (url.startsWith('#')) {
    const [name, ...rest] = url.split('/');
    app.run(name, ...rest) || app.run(ROUTER_404_EVENT, name, ...rest);
    app.run(ROUTER_EVENT, name, ...rest);
  } else if (url.startsWith('/')) {
    const [_, name, ...rest] = url.split('/');
    app.run('/' + name, ...rest) || app.run(ROUTER_404_EVENT, '/' + name, ...rest);
    app.run(ROUTER_EVENT, '/' + name, ...rest);
  } else {
    app.run(url) || app.run(ROUTER_404_EVENT, url);
    app.run(ROUTER_EVENT, url);
  }
}
export default route;
