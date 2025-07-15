/**
 * Comprehensive Unit Tests for Hierarchical Router Behavior
 * 
 * This test suite verifies the new hierarchical routing functionality where
 * routes are tried from most specific to least specific, with remaining
 * segments passed as individual parameters (spread). 404 is fired only at
 * minimal levels (/a, #a, #/a, a), not at root levels.
 * 
 * Test Coverage:
 * - Hash-based hierarchical routing (#a/b/c/d → #a/b/c → #a/b → #a → 404)
 * - Path-based hierarchical routing (/a/b/c/d → /a/b/c → /a/b → /a → 404)
 * - Hash-slash hierarchical routing (#/a/b/c/d → #/a/b/c → #/a/b → #/a → 404)
 * - Non-prefixed hierarchical routing (a/b/c/d → a/b/c → a/b → a → 404)
 * - Parameter spreading (individual parameters, not arrays)
 * - Empty path handling (try # → / → #/ → 404)
 * - Base path support
 * - Hierarchy depth validation (10 levels max)
 * - Backward compatibility with existing exact matches
 * - 404 behavior at minimal levels only
 */

import app from '../src/apprun';
import { ROUTER_EVENT, ROUTER_404_EVENT, route } from '../src/router';

describe('Router - Hierarchical Behavior (New Feature)', () => {
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.warn for 404 tests
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    // Reset lastUrl to prevent duplicate routing prevention
    delete app['lastUrl'];

    // Clear all event handlers to ensure test isolation
    app['_events'] = {};
  });

  afterEach(() => {
    // Clean up mocks
    mockConsoleWarn.mockRestore();
  });

  describe('Hash-based Hierarchical Routing (#a/b/c/d)', () => {
    it('should match exact route when available', () => {
      const exactHandler = jest.fn();
      const parentHandler = jest.fn();

      app.on('#users/123/profile', exactHandler);
      app.on('#users', parentHandler);

      route('#users/123/profile');

      expect(exactHandler).toHaveBeenCalledWith();
      expect(parentHandler).not.toHaveBeenCalled();

      app.off('#users/123/profile', exactHandler);
      app.off('#users', parentHandler);
    });

    it('should fallback to parent route when exact match not found', () => {
      const parentHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#users', parentHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#users/123/profile');

      expect(parentHandler).toHaveBeenCalledWith('123', 'profile');
      expect(routerHandler).toHaveBeenCalledWith('#users', '123', 'profile');

      app.off('#users', parentHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 at minimal level when no hierarchical match found', () => {
      const notFoundHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on(ROUTER_404_EVENT, notFoundHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#users/123/profile');

      // Should fire 404 at minimal level '#users', not at exact path
      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: #users');
      expect(notFoundHandler).toHaveBeenCalledWith('#users/123/profile');
      expect(routerHandler).toHaveBeenCalledWith('#users/123/profile');

      app.off(ROUTER_404_EVENT, notFoundHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should NOT fallback to root handler (#)', () => {
      const rootHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on('#', rootHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('#users/123/profile');

      // Should NOT call root handler, should fire 404 at minimal level
      expect(rootHandler).not.toHaveBeenCalled();
      expect(notFoundHandler).toHaveBeenCalledWith('#users/123/profile');

      app.off('#', rootHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Path-based Hierarchical Routing (/a/b/c/d)', () => {
    it('should match exact route when available', () => {
      const exactHandler = jest.fn();
      const parentHandler = jest.fn();

      app.on('/api/v1/users', exactHandler);
      app.on('/api', parentHandler);

      route('/api/v1/users');

      expect(exactHandler).toHaveBeenCalledWith();
      expect(parentHandler).not.toHaveBeenCalled();

      app.off('/api/v1/users', exactHandler);
      app.off('/api', parentHandler);
    });

    it('should fallback to parent route when exact match not found', () => {
      const parentHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on('/api', parentHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/api/v1/users/123');

      expect(parentHandler).toHaveBeenCalledWith('v1', 'users', '123');
      expect(routerHandler).toHaveBeenCalledWith('/api', 'v1', 'users', '123');

      app.off('/api', parentHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 at minimal level when no hierarchical match found', () => {
      const notFoundHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on(ROUTER_404_EVENT, notFoundHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/api/v1/users/123');

      // Should fire 404 at minimal level '/api', not at exact path
      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: /api');
      expect(notFoundHandler).toHaveBeenCalledWith('/api/v1/users/123');
      expect(routerHandler).toHaveBeenCalledWith('/api/v1/users/123');

      app.off(ROUTER_404_EVENT, notFoundHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should NOT fallback to root handler (/)', () => {
      const rootHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on('/', rootHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('/api/v1/users');

      // Should NOT call root handler, should fire 404 at minimal level
      expect(rootHandler).not.toHaveBeenCalled();
      expect(notFoundHandler).toHaveBeenCalledWith('/api/v1/users');

      app.off('/', rootHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Hash-slash Hierarchical Routing (#/a/b/c/d)', () => {
    it('should match exact route when available', () => {
      const exactHandler = jest.fn();
      const parentHandler = jest.fn();

      app.on('#/users/123/profile', exactHandler);
      app.on('#/users', parentHandler);

      route('#/users/123/profile');

      expect(exactHandler).toHaveBeenCalledWith();
      expect(parentHandler).not.toHaveBeenCalled();

      app.off('#/users/123/profile', exactHandler);
      app.off('#/users', parentHandler);
    });

    it('should fallback to parent route when exact match not found', () => {
      const parentHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#/users', parentHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#/users/123/profile');

      expect(parentHandler).toHaveBeenCalledWith('123', 'profile');
      expect(routerHandler).toHaveBeenCalledWith('#/users', '123', 'profile');

      app.off('#/users', parentHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 at minimal level when no hierarchical match found', () => {
      const notFoundHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on(ROUTER_404_EVENT, notFoundHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#/users/123/profile');

      // Should fire 404 at minimal level '#/users', not at exact path
      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: #/users');
      expect(notFoundHandler).toHaveBeenCalledWith('#/users/123/profile');
      expect(routerHandler).toHaveBeenCalledWith('#/users/123/profile');

      app.off(ROUTER_404_EVENT, notFoundHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should NOT fallback to root handlers (#/ or #)', () => {
      const hashSlashRootHandler = jest.fn();
      const hashRootHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on('#/', hashSlashRootHandler);
      app.on('#', hashRootHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('#/users/123/profile');

      // Should NOT call root handlers, should fire 404 at minimal level
      expect(hashSlashRootHandler).not.toHaveBeenCalled();
      expect(hashRootHandler).not.toHaveBeenCalled();
      expect(notFoundHandler).toHaveBeenCalledWith('#/users/123/profile');

      app.off('#/', hashSlashRootHandler);
      app.off('#', hashRootHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Non-prefixed Hierarchical Routing (a/b/c/d)', () => {
    it('should match exact route when available', () => {
      const exactHandler = jest.fn();
      const parentHandler = jest.fn();

      app.on('users/123/profile', exactHandler);
      app.on('users', parentHandler);

      route('users/123/profile');

      expect(exactHandler).toHaveBeenCalledWith();
      expect(parentHandler).not.toHaveBeenCalled();

      app.off('users/123/profile', exactHandler);
      app.off('users', parentHandler);
    });

    it('should fallback to parent route when exact match not found', () => {
      const parentHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on('users', parentHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('users/123/profile');

      expect(parentHandler).toHaveBeenCalledWith('123', 'profile');
      expect(routerHandler).toHaveBeenCalledWith('users', '123', 'profile');

      app.off('users', parentHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 at minimal level when no hierarchical match found', () => {
      const notFoundHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on(ROUTER_404_EVENT, notFoundHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('users/123/profile');

      // Should fire 404 at minimal level 'users', not at exact path
      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: users');
      expect(notFoundHandler).toHaveBeenCalledWith('users/123/profile');
      expect(routerHandler).toHaveBeenCalledWith('users/123/profile');

      app.off(ROUTER_404_EVENT, notFoundHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle single segment', () => {
      const handler = jest.fn();

      app.on('users', handler);

      route('users/123');

      expect(handler).toHaveBeenCalledWith('123');

      app.off('users', handler);
    });

    it('should handle deep hierarchical match', () => {
      const handler = jest.fn();

      app.on('app', handler);

      route('app/users/123/profile/edit/settings');

      expect(handler).toHaveBeenCalledWith('users', '123', 'profile', 'edit', 'settings');

      app.off('app', handler);
    });
  });

  describe('Empty Path Handling', () => {
    it('should try handlers in priority order: # → / → #/ → 404', () => {
      const hashHandler = jest.fn();
      const pathHandler = jest.fn();
      const hashSlashHandler = jest.fn();

      // Test priority: # is tried first
      app.on('#', hashHandler);
      app.on('/', pathHandler);
      app.on('#/', hashSlashHandler);

      route('');

      expect(hashHandler).toHaveBeenCalledWith();
      expect(pathHandler).not.toHaveBeenCalled();
      expect(hashSlashHandler).not.toHaveBeenCalled();

      app.off('#', hashHandler);
      app.off('/', pathHandler);
      app.off('#/', hashSlashHandler);
    });

    it('should fallback to / when # not found', () => {
      const pathHandler = jest.fn();
      const hashSlashHandler = jest.fn();

      app.on('/', pathHandler);
      app.on('#/', hashSlashHandler);

      route('');

      expect(pathHandler).toHaveBeenCalledWith();
      expect(hashSlashHandler).not.toHaveBeenCalled();

      app.off('/', pathHandler);
      app.off('#/', hashSlashHandler);
    });

    it('should fallback to #/ when # and / not found', () => {
      const hashSlashHandler = jest.fn();

      app.on('#/', hashSlashHandler);

      route('');

      expect(hashSlashHandler).toHaveBeenCalledWith();

      app.off('#/', hashSlashHandler);
    });

    it('should fire 404 when no empty path handlers found', () => {
      const notFoundHandler = jest.fn();

      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: ');
      expect(notFoundHandler).toHaveBeenCalledWith('');

      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Base Path Support', () => {
    beforeEach(() => {
      app['basePath'] = '/myapp';
    });

    afterEach(() => {
      delete app['basePath'];
    });

    it('should strip base path before hierarchical matching', () => {
      const handler = jest.fn();

      app.on('/users', handler);

      route('/myapp/users/123');

      expect(handler).toHaveBeenCalledWith('123');

      app.off('/users', handler);
    });

    it('should handle base path with hierarchical fallback', () => {
      const handler = jest.fn();

      app.on('/api', handler);

      route('/myapp/api/v1/users');

      expect(handler).toHaveBeenCalledWith('v1', 'users');

      app.off('/api', handler);
    });
  });

  describe('Hierarchy Depth Validation', () => {
    let mockConsoleWarn: jest.SpyInstance;

    beforeEach(() => {
      mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      mockConsoleWarn.mockRestore();
    });

    it('should warn for hierarchies deeper than 10 levels', () => {
      const handler = jest.fn();

      app.on('/app', handler);

      route('/app/a/b/c/d/e/f/g/h/i/j/k/l');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Deep route hierarchy detected')
      );

      app.off('/app', handler);
    });

    it('should not warn for hierarchies 10 levels or less', () => {
      const handler = jest.fn();

      app.on('/app', handler);

      route('/app/a/b/c/d/e/f/g/h/i/j');

      expect(mockConsoleWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('Deep route hierarchy detected')
      );

      app.off('/app', handler);
    });
  });

  describe('Enhanced Edge Cases', () => {
    it('should handle empty segments in hierarchical paths', () => {
      const handler = jest.fn();

      app.on('/api', handler);

      route('/api//users');

      expect(handler).toHaveBeenCalledWith('', 'users');

      app.off('/api', handler);
    });

    it('should handle trailing slashes by normalizing them', () => {
      const handler = jest.fn();

      app.on('/api', handler);

      route('/api/users/');

      expect(handler).toHaveBeenCalledWith('users');

      app.off('/api', handler);
    });

    it('should handle single character segments', () => {
      const handler = jest.fn();

      app.on('#a', handler);

      route('#a/b/c');

      expect(handler).toHaveBeenCalledWith('b', 'c');

      app.off('#a', handler);
    });
  });

  describe('Backward Compatibility', () => {
    it('should preserve existing parameter spreading for exact matches', () => {
      const handler = jest.fn();

      app.on('#users', handler);

      route('#users/123/profile');

      // This should work the same as before - spread parameters
      expect(handler).toHaveBeenCalledWith('123', 'profile');

      app.off('#users', handler);
    });

    it('should preserve existing behavior for path routes', () => {
      const handler = jest.fn();

      app.on('/api', handler);

      route('/api/v1/users');

      // This should work the same as before - spread parameters
      expect(handler).toHaveBeenCalledWith('v1', 'users');

      app.off('/api', handler);
    });

    it('should preserve existing behavior for non-prefixed routes', () => {
      const handler = jest.fn();

      app.on('simple', handler);

      route('simple');

      // This should work the same as before
      expect(handler).toHaveBeenCalledWith();

      app.off('simple', handler);
    });
  });

  describe('Priority and Matching Order', () => {
    it('should prefer exact match over hierarchical match', () => {
      const exactHandler = jest.fn();
      const parentHandler = jest.fn();

      app.on('#users/123', exactHandler);
      app.on('#users', parentHandler);

      route('#users/123');

      expect(exactHandler).toHaveBeenCalledWith();
      expect(parentHandler).not.toHaveBeenCalled();

      app.off('#users/123', exactHandler);
      app.off('#users', parentHandler);
    });

    it('should prefer deeper hierarchical match over shallower', () => {
      const deepHandler = jest.fn();
      const shallowHandler = jest.fn();

      app.on('#users/123', deepHandler);
      app.on('#users', shallowHandler);

      route('#users/123/profile');

      expect(deepHandler).toHaveBeenCalledWith('profile');
      expect(shallowHandler).not.toHaveBeenCalled();

      app.off('#users/123', deepHandler);
      app.off('#users', shallowHandler);
    });

    it('should fallback to shallower match when deeper not found', () => {
      const shallowHandler = jest.fn();

      app.on('#users', shallowHandler);

      route('#users/123/profile/edit');

      expect(shallowHandler).toHaveBeenCalledWith('123', 'profile', 'edit');

      app.off('#users', shallowHandler);
    });
  });

  describe('Router Events with Hierarchical Matching', () => {
    it('should fire ROUTER_EVENT with matched route and remaining parameters', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#users', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#users/123/profile');

      expect(routerHandler).toHaveBeenCalledWith('#users', '123', 'profile');

      app.off('#users', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should fire ROUTER_404_EVENT for complete hierarchical miss', () => {
      const routerHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on(ROUTER_EVENT, routerHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('#nonexistent/path');

      expect(routerHandler).toHaveBeenCalledWith('#nonexistent/path');
      expect(notFoundHandler).toHaveBeenCalledWith('#nonexistent/path');

      app.off(ROUTER_EVENT, routerHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Duplicate Prevention with Hierarchical Routing', () => {
    it('should prevent duplicate hierarchical routing', () => {
      const handler = jest.fn();

      app.on('#users', handler);

      route('#users/123');
      route('#users/123'); // Should be ignored

      expect(handler).toHaveBeenCalledTimes(1);

      app.off('#users', handler);
    });

    it('should allow different hierarchical routes', () => {
      const handler = jest.fn();

      app.on('#users', handler);

      route('#users/123');
      route('#users/456');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, '123');
      expect(handler).toHaveBeenNthCalledWith(2, '456');

      app.off('#users', handler);
    });
  });
});
