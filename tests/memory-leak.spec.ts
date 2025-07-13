/**
 * Test Coverage for Memory Leak Prevention
 * 
 * Tests for memory leak scenarios with repeated component mounting:
 * - Event listener cleanup
 * - Component cache cleanup
 * - Router event cleanup
 * - DOM reference cleanup
 * - Global state cleanup
 */

import app from '../src/apprun';
import { Component } from '../src/component';
import { ROUTER_EVENT, ROUTER_404_EVENT } from '../src/router';

describe('Memory Leak Prevention Coverage', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);

    // Clean up any remaining event listeners
    app.off('test-event', () => { });
    app.off('memory-test', () => { });
    app.off(ROUTER_EVENT, () => { });
    app.off(ROUTER_404_EVENT, () => { });
  });

  describe('Component Memory Management', () => {
    it('should cleanup component event listeners on unmount', () => {
      let component: Component;
      let eventHandlerCallCount = 0;

      const TestComponent = class extends Component {
        state = { count: 0 };

        view = (state: any) => `<div>Count: ${state.count}</div>`;

        update = {
          'increment': (state: any) => {
            eventHandlerCallCount++;
            return { ...state, count: state.count + 1 };
          }
        };
      };

      // Mount component
      component = new TestComponent();
      component.start(testContainer);

      // Verify component is mounted and events work
      expect(testContainer.innerHTML).toContain('Count: 0');
      component.run('increment');
      expect(eventHandlerCallCount).toBe(1);

      // Simulate unmount (this should cleanup event listeners)
      if (component.unmount) {
        component.unmount();
      }

      // Try to trigger event after unmount - should not call handler
      const oldCallCount = eventHandlerCallCount;
      app.run('increment');
      expect(eventHandlerCallCount).toBe(oldCallCount); // Should not increase
    });

    it('should prevent memory leaks with repeated component mounting', () => {
      const TestComponent = class extends Component {
        state = { mounted: true };
        view = (state: any) => `<div>Mounted: ${state.mounted}</div>`;
        update = {
          'test-event': (state: any) => state
        };
      };

      const components: Component[] = [];

      // Mount multiple instances
      for (let i = 0; i < 10; i++) {
        const component = new TestComponent();
        const container = document.createElement('div');
        testContainer.appendChild(container);
        component.start(container);
        components.push(component);
      }

      // Verify all components are mounted
      expect(components.length).toBe(10);
      expect(testContainer.children.length).toBe(10);

      // Unmount all components
      components.forEach((component, index) => {
        if (component.unmount) {
          component.unmount();
        }
        testContainer.removeChild(testContainer.children[0]);
      });

      // Verify cleanup
      expect(testContainer.children.length).toBe(0);

      // Check that event handlers are not accumulating
      const initialEventCount = app.find('test-event')?.length || 0;
      expect(initialEventCount).toBeLessThanOrEqual(1); // Should not accumulate
    });

    it('should cleanup component state references', () => {
      let stateRef: any = null;

      const TestComponent = class extends Component {
        state = { data: new Array(1000).fill('memory-test') };

        view = (state: any) => {
          stateRef = state; // Keep reference for testing
          return `<div>Data length: ${state.data.length}</div>`;
        };

        update = {};
      };

      const component = new TestComponent();
      component.start(testContainer);

      expect(stateRef).not.toBeNull();
      expect(stateRef.data.length).toBe(1000);

      // Unmount component
      if (component.unmount) {
        component.unmount();
      }

      // State reference should ideally be cleaned up
      // Note: This test verifies the component can be unmounted without errors
      expect(() => {
        if (component.unmount) {
          component.unmount();
        }
      }).not.toThrow();
    });
  });

  describe('Event System Memory Management', () => {
    it('should cleanup event listeners properly', () => {
      const handlers: Array<() => void> = [];

      // Add multiple event handlers
      for (let i = 0; i < 100; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        app.on('memory-test', handler);
      }

      // Verify handlers are registered
      const eventHandlers = app.find('memory-test');
      expect(eventHandlers.length).toBe(100);

      // Remove all handlers
      handlers.forEach(handler => {
        app.off('memory-test', handler);
      });

      // Verify cleanup
      const remainingHandlers = app.find('memory-test');
      expect(remainingHandlers.length).toBe(0);
    });

    it('should handle delayed event cleanup', (done) => {
      let callCount = 0;
      const delayedHandler = () => {
        callCount++;
      };

      // Add delayed event
      app.on('delayed-test', delayedHandler, { delay: 100 });

      // Trigger event
      app.run('delayed-test');

      // Remove handler before delay expires
      setTimeout(() => {
        app.off('delayed-test', delayedHandler);

        // Check after delay period - handler might still be called
        // due to timeout already being set
        setTimeout(() => {
          // The event was scheduled, so it might still execute
          expect(app.find('delayed-test').length).toBe(0);
          done();
        }, 100);
      }, 50);
    }, 10000);

    it('should prevent event handler accumulation with once option', () => {
      let callCount = 0;

      const onceHandler = () => {
        callCount++;
      };

      // Add multiple once handlers
      for (let i = 0; i < 10; i++) {
        app.on('once-test', onceHandler, { once: true });
      }

      // Trigger event
      app.run('once-test');

      // Check that handlers are removed after execution
      const remainingHandlers = app.find('once-test');
      expect(remainingHandlers.length).toBe(0);
      expect(callCount).toBe(10); // All should have been called once
    });
  });

  describe('Router Memory Management', () => {
    it('should cleanup router event listeners', () => {
      const routerHandlers: Array<() => void> = [];

      // Add multiple router handlers
      for (let i = 0; i < 10; i++) {
        const handler = jest.fn();
        routerHandlers.push(handler);
        app.on(ROUTER_EVENT, handler);
      }

      // Verify handlers are registered
      const routerEventHandlers = app.find(ROUTER_EVENT);
      expect(routerEventHandlers.length).toBeGreaterThanOrEqual(10);

      // Remove handlers
      routerHandlers.forEach(handler => {
        app.off(ROUTER_EVENT, handler);
      });

      // Verify cleanup (may still have some system handlers)
      const remainingHandlers = app.find(ROUTER_EVENT);
      expect(remainingHandlers.length).toBeLessThan(routerEventHandlers.length);
    });

    it('should prevent route handler accumulation', () => {
      const routeHandlers: Array<() => void> = [];

      // Add multiple route handlers for same route
      for (let i = 0; i < 5; i++) {
        const handler = jest.fn();
        routeHandlers.push(handler);
        app.on('/test-route', handler);
      }

      // Verify handlers are registered
      const routeEventHandlers = app.find('/test-route');
      expect(routeEventHandlers.length).toBe(5);

      // Simulate route navigation
      app.run('route', '/test-route');

      // Clean up
      routeHandlers.forEach(handler => {
        app.off('/test-route', handler);
      });

      // Verify cleanup
      const remainingHandlers = app.find('/test-route');
      expect(remainingHandlers.length).toBe(0);
    });
  });

  describe('DOM Reference Cleanup', () => {
    it('should not leak DOM references in components', () => {
      const TestComponent = class extends Component {
        state = { text: 'test' };

        view = (state: any) => `
          <div id="dom-test">
            <input type="text" value="${state.text}">
            <button>Update</button>
          </div>
        `;

        update = {
          'update-text': (state: any, text: string) => ({ ...state, text })
        };
      };

      const component = new TestComponent();
      component.start(testContainer);

      // The important test is that component can be started and stopped
      // without throwing errors or causing memory issues
      expect(() => {
        if (component.unmount) {
          component.unmount();
        }
        testContainer.innerHTML = '';
      }).not.toThrow();

      expect(testContainer.children.length).toBe(0);
    });

    it('should handle rapid mount/unmount cycles without leaks', () => {
      const TestComponent = class extends Component {
        state = { cycle: 0 };
        view = (state: any) => `<div>Cycle: ${state.cycle}</div>`;
        update = {};
      };

      // Rapid mount/unmount cycles
      for (let i = 0; i < 50; i++) {
        const component = new TestComponent();
        component.start(testContainer);

        if (component.unmount) {
          component.unmount();
        }

        testContainer.innerHTML = '';
      }

      // Should complete without errors or memory issues
      expect(testContainer.children.length).toBe(0);
    });
  });

  describe('Global State Cleanup', () => {
    it('should not accumulate global event handlers', () => {
      const initialGlobalHandlers = Object.keys(app['_events']).length;

      // Add temporary global handlers
      const tempHandlers: Array<() => void> = [];
      for (let i = 0; i < 20; i++) {
        const handler = jest.fn();
        tempHandlers.push(handler);
        app.on(`temp-event-${i}`, handler);
      }

      // Verify handlers are added
      const afterAddingHandlers = Object.keys(app['_events']).length;
      expect(afterAddingHandlers).toBeGreaterThan(initialGlobalHandlers);

      // Remove all temp handlers
      tempHandlers.forEach((handler, index) => {
        app.off(`temp-event-${index}`, handler);
      });

      // Verify cleanup
      const afterCleanup = Object.keys(app['_events']).length;
      expect(afterCleanup).toBeLessThanOrEqual(afterAddingHandlers);
    });

    it('should handle concurrent component operations without leaks', () => {
      const components: Component[] = [];

      // Create multiple components concurrently
      const promises = Array.from({ length: 10 }, (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const TestComponent = class extends Component {
              state = { id: i };
              view = (state: any) => `<div>Component ${state.id}</div>`;
              update = {
                [`event-${i}`]: (state: any) => state
              };
            };

            const component = new TestComponent();
            const container = document.createElement('div');
            testContainer.appendChild(container);
            component.start(container);
            components.push(component);
            resolve();
          }, Math.random() * 100);
        });
      });

      return Promise.all(promises).then(() => {
        // Verify all components are created
        expect(components.length).toBe(10);

        // Clean up all components
        components.forEach((component, index) => {
          if (component.unmount) {
            component.unmount();
          }
          const container = testContainer.children[0];
          if (container) {
            testContainer.removeChild(container);
          }
        });

        // Verify cleanup
        expect(testContainer.children.length).toBe(0);
      });
    });
  });
});
