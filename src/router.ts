/**
 * AppRun Router Implementation with Hierarchical Matching
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
 * - **NEW: Hierarchical route matching** - progressively tries parent routes
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced route type definitions
 * - Better parameter type inference
 * - Improved URL validation and error handling
 * 
 * Usage:
 * ```ts
 * // Basic routing
 * app.on('#/home', () => // Show home page);
 * app.on('#/users/:id', (id) => // Show user profile);
 * app.on('/api/*', (path) => // Handle API routes);
 * 
 * // Navigate programmatically  
 * app.run('route', '#/home');
 * route('/users/123'); // Direct routing
 * 
 * // Hierarchical matching examples
 * app.on('/api', (operation, id) => // Handle /api/users/123);
 * app.on('#users', (id, action) => // Handle #users/123/edit);
 * 
 * // Hierarchical Route Matching (NEW):
 * // For URL: /api/v1/users/123
 * // Router tries: /api/v1/users/123 → /api/v1/users → /api/v1 → /api → 404
 * // If handler found at /api, it receives: ('v1', 'users', '123')
 * 
 * // Base Path Support (NEW):
 * app.basePath = '/myapp'; // For sub-directory deployments
 * // Links: <a href="/users/123"> (relative paths)
 * // Navigation: /myapp/users/123 (full path)
 * // Routing: /users/123 (base path stripped)
 * 
 * // Empty Path Handling (NEW):
 * // For URL: "" (empty)
 * // Router tries: # → / → #/ → 404 (in priority order)
 * 
 * // 404 Behavior (ENHANCED):
 * // Fires only at minimal levels: /a, #a, #/a, a
 * // Never tries root handlers: /, #, #/
 * ```
 */

import app from './app';

// Helper functions for hierarchical routing

/**
 * Extract clean path segments from URL
 * @param url - The URL to parse
 * @returns Array of path segments
 */
function parsePathSegments(url: string): string[] {
  if (!url) return [];

  // Handle different URL types
  if (url.startsWith('#/')) {
    return url.substring(2).split('/');
  } else if (url.startsWith('#')) {
    return url.substring(1).split('/');
  } else if (url.startsWith('/')) {
    return url.substring(1).split('/');
  } else {
    return url.split('/');
  }
}

/**
 * Normalize trailing slash - convert /a/ to /a
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
function normalizeTrailingSlash(url: string): string {
  if (!url || url === '/' || url === '#' || url === '#/') return url;
  if (url.endsWith('/')) return url.slice(0, -1);
  return url;
}

/**
 * Validate hierarchy depth and warn if too deep
 * @param segments - Path segments to validate
 */
function validateHierarchyDepth(segments: string[]): void {
  // Count non-empty segments for depth validation
  const nonEmptySegments = segments.filter(Boolean);
  if (nonEmptySegments.length > 11) {
    console.warn(`Deep route hierarchy detected: ${nonEmptySegments.join('/')} (${nonEmptySegments.length} levels)`);
  }
}

/**
 * Strip base path from URL
 * @param url - The URL to process
 * @param basePath - The base path to remove
 * @returns URL with base path removed
 */
function stripBasePath(url: string, basePath: string): string {
  if (!basePath || basePath === '/' || basePath === '') return url;

  // Normalize base path
  const normalizedBasePath = basePath.startsWith('/') ? basePath : '/' + basePath;

  if (url.startsWith(normalizedBasePath)) {
    const stripped = url.substring(normalizedBasePath.length);
    return stripped.startsWith('/') ? stripped : '/' + stripped;
  }

  return url;
}

/**
 * Generate hierarchy of routes to try (stops at minimal level)
 * @param segments - Array of path segments
 * @param routeType - Type of route (path, hash, hash-slash, non-prefixed)
 * @returns Array of route names to try in order
 */
function generateRouteHierarchy(segments: string[], routeType: 'path' | 'hash' | 'hash-slash' | 'non-prefixed'): string[] {
  const hierarchy: string[] = [];

  // Build hierarchy from most specific to least specific
  for (let i = segments.length; i > 0; i--) {
    const currentSegments = segments.slice(0, i);
    let routeName = '';

    switch (routeType) {
      case 'path':
        routeName = '/' + currentSegments.join('/');
        break;
      case 'hash':
        routeName = '#' + currentSegments.join('/');
        break;
      case 'hash-slash':
        routeName = '#/' + currentSegments.join('/');
        break;
      case 'non-prefixed':
        routeName = currentSegments.join('/');
        break;
    }

    hierarchy.push(routeName);
  }

  return hierarchy;
}

/**
 * Find handler in hierarchy and return handler info
 * @param hierarchy - Array of route names to try
 * @param originalSegments - Original path segments
 * @returns Handler info if found, null otherwise
 */
function findHandlerInHierarchy(hierarchy: string[], originalSegments: string[]): { eventName: string; parameters: string[] } | null {
  for (let i = 0; i < hierarchy.length; i++) {
    const routeName = hierarchy[i];
    const subscribers = app.find(routeName);

    if (subscribers && subscribers.length > 0) {
      // Found handler - calculate remaining parameters
      const handlerDepth = hierarchy.length - i;
      const parameters = originalSegments.slice(handlerDepth);

      return {
        eventName: routeName,
        parameters: parameters
      };
    }
  }

  return null;
}

/**
 * Handle empty path with priority order: # → / → #/ → 404
 */
function handleEmptyPath(): void {
  // Try # first
  const hashSubscribers = app.find('#');
  if (hashSubscribers && hashSubscribers.length > 0) {
    app.run('#');
    app.run(ROUTER_EVENT, '#');
    return;
  }

  // Try / second
  const pathSubscribers = app.find('/');
  if (pathSubscribers && pathSubscribers.length > 0) {
    app.run('/');
    app.run(ROUTER_EVENT, '/');
    return;
  }

  // Try #/ third
  const hashSlashSubscribers = app.find('#/');
  if (hashSlashSubscribers && hashSlashSubscribers.length > 0) {
    app.run('#/');
    app.run(ROUTER_EVENT, '#/');
    return;
  }

  // Fire 404 if no handlers found
  console.warn('No subscribers for event: ');
  app.run(ROUTER_404_EVENT, '');
  app.run(ROUTER_EVENT, '');
}

/**
 * Main hierarchical routing logic
 * @param url - The URL to route
 */
function routeWithHierarchy(url: string): void {
  // Handle empty path
  if (!url) {
    handleEmptyPath();
    return;
  }

  // Normalize trailing slash
  url = normalizeTrailingSlash(url);

  // Strip base path if configured
  const basePath = app['basePath'];
  if (basePath) {
    url = stripBasePath(url, basePath);
  }

  // Parse segments and validate depth
  const segments = parsePathSegments(url);
  validateHierarchyDepth(segments);

  // Determine route type
  let routeType: 'path' | 'hash' | 'hash-slash' | 'non-prefixed';
  if (url.startsWith('#/')) {
    routeType = 'hash-slash';
  } else if (url.startsWith('#')) {
    routeType = 'hash';
  } else if (url.startsWith('/')) {
    routeType = 'path';
  } else {
    routeType = 'non-prefixed';
  }

  // Generate hierarchy
  const hierarchy = generateRouteHierarchy(segments, routeType);

  // Find handler in hierarchy
  const handlerInfo = findHandlerInHierarchy(hierarchy, segments);

  if (handlerInfo) {
    // Found handler - publish route with parameters
    publishRoute(handlerInfo.eventName, ...handlerInfo.parameters);
  } else {
    // No handler found - fire 404 with original URL
    if (hierarchy.length > 0) {
      const minimalRoute = hierarchy[hierarchy.length - 1];
      console.warn(`No subscribers for event: ${minimalRoute}`);
      app.run(ROUTER_404_EVENT, url);
      app.run(ROUTER_EVENT, url);
    } else {
      handleEmptyPath();
    }
  }
}

const publishRoute = (name: string, ...args: any[]) => {
  if (!name || name === ROUTER_EVENT || name === ROUTER_404_EVENT) return;
  const subscribers = app.find(name);
  if (!subscribers || subscribers.length === 0) {
    console.warn(`No subscribers for event: ${name}`);
    app.run(ROUTER_404_EVENT, name, ...args);
  } else {
    app.run(name, ...args);
  }
  app.run(ROUTER_EVENT, name, ...args);
}

export type Route = (url: string, ...args: any[]) => any;

export const ROUTER_EVENT: string = '//';
export const ROUTER_404_EVENT: string = '///';
export const route: Route = (url: string) => {
  if (app['lastUrl'] === url) return; // Prevent duplicate routing
  app['lastUrl'] = url;

  // Use hierarchical routing logic
  routeWithHierarchy(url);
}
export default route;
