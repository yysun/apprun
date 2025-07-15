/**
 * Comprehensive Unit Tests for Existing Router Behavior
 * 
 * This test suite verifies the current router functionality before implementing
 * hierarchical routing to ensure backward compatibility.
 * 
 * Test Coverage:
 * - Hash-based routing (#path)
 * - Path-based routing (/path)
 * - Non-prefixed routing (path)
 * - Parameter passing behavior (spreading)
 * - 404 handling
 * - Duplicate routing prevention
 * - Router event firing
 */

import app from '../src/apprun';
import { ROUTER_EVENT, ROUTER_404_EVENT, route } from '../src/router';

describe('Router - Existing Behavior (Before Hierarchical)', () => {
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.warn for 404 tests
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    // Reset lastUrl to prevent duplicate routing prevention
    delete app['lastUrl'];
  });

  afterEach(() => {
    // Clean up mocks
    mockConsoleWarn.mockRestore();
  });

  describe('Hash-based Routing (#path)', () => {
    it('should handle simple hash route', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#home', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#home');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('#home');

      app.off('#home', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle hash route with single parameter', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#users', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#users/123');

      expect(handler).toHaveBeenCalledWith('123');
      expect(routerHandler).toHaveBeenCalledWith('#users', '123');

      app.off('#users', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle hash route with multiple parameters', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#products', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#products/electronics/laptops/gaming');

      expect(handler).toHaveBeenCalledWith('electronics', 'laptops', 'gaming');
      expect(routerHandler).toHaveBeenCalledWith('#products', 'electronics', 'laptops', 'gaming');

      app.off('#products', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle root hash route', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('#');

      app.off('#', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle empty URL as hash', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('#');

      app.off('#', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 for unregistered hash route', () => {
      const routerHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on(ROUTER_EVENT, routerHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('#nonexistent');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: #nonexistent');
      expect(notFoundHandler).toHaveBeenCalledWith('#nonexistent');
      expect(routerHandler).toHaveBeenCalledWith('#nonexistent');

      app.off(ROUTER_EVENT, routerHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Path-based Routing (/path)', () => {
    it('should handle simple path route', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('/home', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/home');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('/home');

      app.off('/home', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle path route with single parameter', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('/users', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/users/123');

      expect(handler).toHaveBeenCalledWith('123');
      expect(routerHandler).toHaveBeenCalledWith('/users', '123');

      app.off('/users', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle path route with multiple parameters', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('/api', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/api/v1/users/123');

      expect(handler).toHaveBeenCalledWith('v1', 'users', '123');
      expect(routerHandler).toHaveBeenCalledWith('/api', 'v1', 'users', '123');

      app.off('/api', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle root path route', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('/', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('/');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('/');

      app.off('/', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 for unregistered path route', () => {
      const routerHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on(ROUTER_EVENT, routerHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('/nonexistent');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: /nonexistent');
      expect(notFoundHandler).toHaveBeenCalledWith('/nonexistent');
      expect(routerHandler).toHaveBeenCalledWith('/nonexistent');

      app.off(ROUTER_EVENT, routerHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Non-prefixed Routing (path)', () => {
    it('should handle simple non-prefixed route', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('home', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('home');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('home');

      app.off('home', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should handle non-prefixed route as single event', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('complex/path/here', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('complex/path/here');

      expect(handler).toHaveBeenCalledWith();
      expect(routerHandler).toHaveBeenCalledWith('complex/path/here');

      app.off('complex/path/here', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should trigger 404 for unregistered non-prefixed route', () => {
      const routerHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on(ROUTER_EVENT, routerHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('nonexistent');

      expect(mockConsoleWarn).toHaveBeenCalledWith('No subscribers for event: nonexistent');
      expect(notFoundHandler).toHaveBeenCalledWith('nonexistent');
      expect(routerHandler).toHaveBeenCalledWith('nonexistent');

      app.off(ROUTER_EVENT, routerHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Duplicate Routing Prevention', () => {
    it('should prevent duplicate routing for same URL', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#home', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#home');
      route('#home'); // Second call should be ignored

      expect(handler).toHaveBeenCalledTimes(1);
      expect(routerHandler).toHaveBeenCalledTimes(1);

      app.off('#home', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should allow routing to different URLs', () => {
      const homeHandler = jest.fn();
      const aboutHandler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#home', homeHandler);
      app.on('#about', aboutHandler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#home');
      route('#about');

      expect(homeHandler).toHaveBeenCalledTimes(1);
      expect(aboutHandler).toHaveBeenCalledTimes(1);
      expect(routerHandler).toHaveBeenCalledTimes(2);

      app.off('#home', homeHandler);
      app.off('#about', aboutHandler);
      app.off(ROUTER_EVENT, routerHandler);
    });
  });

  describe('Router Event Behavior', () => {
    it('should fire ROUTER_EVENT for valid routes', () => {
      const handler = jest.fn();
      const routerHandler = jest.fn();

      app.on('#test', handler);
      app.on(ROUTER_EVENT, routerHandler);

      route('#test');

      expect(routerHandler).toHaveBeenCalledWith('#test');
      expect(routerHandler).toHaveBeenCalledTimes(1);

      app.off('#test', handler);
      app.off(ROUTER_EVENT, routerHandler);
    });

    it('should fire ROUTER_EVENT for invalid routes', () => {
      const routerHandler = jest.fn();
      const notFoundHandler = jest.fn();

      app.on(ROUTER_EVENT, routerHandler);
      app.on(ROUTER_404_EVENT, notFoundHandler);

      route('#invalid');

      expect(routerHandler).toHaveBeenCalledWith('#invalid');
      expect(notFoundHandler).toHaveBeenCalledWith('#invalid');

      app.off(ROUTER_EVENT, routerHandler);
      app.off(ROUTER_404_EVENT, notFoundHandler);
    });
  });

  describe('Parameter Passing Behavior', () => {
    it('should spread parameters for hash routes', () => {
      const handler = jest.fn();

      app.on('#users', handler);

      route('#users/123/profile/edit');

      expect(handler).toHaveBeenCalledWith('123', 'profile', 'edit');

      app.off('#users', handler);
    });

    it('should spread parameters for path routes', () => {
      const handler = jest.fn();

      app.on('/api', handler);

      route('/api/v1/users/123/posts/456');

      expect(handler).toHaveBeenCalledWith('v1', 'users', '123', 'posts', '456');

      app.off('/api', handler);
    });

    it('should handle single parameter correctly', () => {
      const handler = jest.fn();

      app.on('#user', handler);

      route('#user/123');

      expect(handler).toHaveBeenCalledWith('123');

      app.off('#user', handler);
    });

    it('should handle no parameters correctly', () => {
      const handler = jest.fn();

      app.on('#home', handler);

      route('#home');

      expect(handler).toHaveBeenCalledWith();

      app.off('#home', handler);
    });
  });
});
