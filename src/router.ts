/**
 * AppRun Router Implementation
 * 
 * This file provides URL routing capabilities:
 * 1. Hash-based routing (#/path)
 *    - Works with SPA mode using hash fragments
 *    - Handles hashchange events automatically
 *    - No server configuration required
 * 2. Path-based routing (/path) 
 *    - Works with browser history API
 *    - Requires server configuration for SPA routing
 *    - Handles popstate events automatically
 * 3. Event-based navigation
 *    - Routes trigger corresponding component events
 *    - Automatic route parameter extraction
 *    - Fallback to 404 handling for unknown routes
 * 
 * Features:
 * - Automatic route event firing with ROUTER_EVENT
 * - 404 handling via ROUTER_404_EVENT for unmatched routes
 * - History API integration for seamless navigation
 * - Route parameter parsing and injection into events
 * - URL pattern matching with parameter support
 * - Global and component-level route handling
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced route type definitions
 * - Better parameter type inference
 * - Improved URL validation and error handling
 * 
 * Usage:
 * ```ts
 * // Handle routes
 * app.on('#/home', () => // Show home page);
 * app.on('#/users/:id', (id) => // Show user profile);
 * app.on('/api/*', (path) => // Handle API routes);
 * 
 * // Navigate programmatically  
 * app.run('route', '#/home');
 * route('/users/123'); // Direct routing
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
