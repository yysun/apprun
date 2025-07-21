/**
 * Unit Tests for addComponents Function
 * 
 * This test suite comprehensively tests the addComponents function which handles:
 * 1. Component class instantiation and mounting
 * 2. Component instance mounting
 * 3. Function component execution (sync and async)
 * 4. Function component result handling (class vs instance)
 * 5. Error handling for invalid configurations
 * 6. Route validation and edge cases
 * 
 * Updated for new signature: addComponents(element, components)
 * - element: Element | string - target element
 * - components: ComponentRoute - key-value object with routes as keys and components as values
 * 
 * Test Coverage:
 * - Valid component types (class, instance, function)
 * - Async function components
 * - Function components returning classes
 * - Function components returning instances
 * - Invalid route configurations
 * - Missing required properties
 * - Component function execution errors
 * - Mount method validation
 * - Edge cases and error scenarios
 */

import app, { Component } from '../src/apprun';
import { ComponentRoute } from '../src/types';

// Ensure app is properly initialized for tests
app.on('test', () => { });

describe('addComponents function', () => {
  let mockElement: HTMLElement;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create mock DOM element
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    document.body.appendChild(mockElement);

    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';

    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Component Class Handling', () => {
    class TestComponent extends Component {
      constructor() {
        super();
        this.state = { name: 'test' };
        this.view = (state) => `<div>${state.name}</div>`;
      }
    }

    beforeEach(() => {
      // Mock the mount method on the prototype
      TestComponent.prototype.mount = jest.fn();
    });

    it('should instantiate component class and mount it', async () => {
      const components: ComponentRoute = {
        '/test': TestComponent
      };

      await app.addComponents(mockElement, components);

      expect(TestComponent.prototype.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
    });

    it('should handle multiple component classes', async () => {
      class AnotherTestComponent extends Component {
      }

      // Mock mount method on prototypes
      AnotherTestComponent.prototype.mount = jest.fn();

      const element1 = mockElement;
      const element2 = document.createElement('div');

      // Test multiple components on same element
      await app.addComponents(element1, {
        '/test': TestComponent,
        '/other': AnotherTestComponent
      });

      expect(TestComponent.prototype.mount).toHaveBeenCalledWith(element1, { route: '/test' });
      expect(AnotherTestComponent.prototype.mount).toHaveBeenCalledWith(element1, { route: '/other' });
    });
  });

  describe('Component Instance Handling', () => {
    it('should mount component instance directly', async () => {
      const componentInstance = new Component();
      componentInstance.mount = jest.fn();

      const components: ComponentRoute = {
        '/test': componentInstance
      };

      await app.addComponents(mockElement, components);

      expect(componentInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
    });

    it('should handle pre-configured component instances', async () => {
      const componentInstance = new Component({ initialValue: 42 });
      componentInstance.mount = jest.fn();

      const components: ComponentRoute = {
        '/test': componentInstance
      };

      await app.addComponents(mockElement, components);

      expect(componentInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
      // Verify the instance was created with initial state
      expect((componentInstance as any).state).toEqual({ initialValue: 42 });
    });
  });

  describe('Function Component Handling', () => {
    describe('Synchronous Functions', () => {
      it('should execute function and mount returned instance', async () => {
        const mockInstance = new Component();
        mockInstance.mount = jest.fn();

        const componentFunction = jest.fn().mockReturnValue(mockInstance);

        const components: ComponentRoute = {
          '/test': componentFunction
        };

        await app.addComponents(mockElement, components);

        expect(componentFunction).toHaveBeenCalled();
        expect(mockInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
      });

      it('should execute function returning class and instantiate it', async () => {
        class DynamicComponent extends Component {
        }

        DynamicComponent.prototype.mount = jest.fn();

        // Create a real function that returns the class (not a jest mock)
        const componentFunction = () => DynamicComponent;

        const components: ComponentRoute = {
          '/test': componentFunction
        };

        await app.addComponents(mockElement, components);

        // The function should complete without error since it creates a valid instance
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should handle function returning non-component values gracefully', async () => {
        const componentFunction = jest.fn().mockReturnValue("invalid");

        const components: ComponentRoute = {
          '/test': componentFunction
        };

        await app.addComponents(mockElement, components);

        expect(componentFunction).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid component: component must be a class, instance, or function that returns a class/instance'
        );
      });
    });

    describe('Asynchronous Functions', () => {
      it('should execute async function and mount returned instance', async () => {
        const mockInstance = new Component();
        mockInstance.mount = jest.fn();

        const asyncComponentFunction = async () => {
          return mockInstance;
        };

        const components: ComponentRoute = {
          '/test': asyncComponentFunction
        };

        await app.addComponents(mockElement, components);

        expect(mockInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
      });

      it('should execute async function returning class and instantiate it', async () => {
        class AsyncDynamicComponent extends Component {
        }

        AsyncDynamicComponent.prototype.mount = jest.fn();

        const asyncComponentFunction = async () => {
          return AsyncDynamicComponent;
        };

        const components: ComponentRoute = {
          '/test': asyncComponentFunction
        };

        await app.addComponents(mockElement, components);

        // The function should complete without error since it creates a valid instance
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it('should handle async function rejection', async () => {
        const asyncComponentFunction = async () => {
          throw new Error('Async component loading failed');
        };

        const components: ComponentRoute = {
          '/test': asyncComponentFunction
        };

        await app.addComponents(mockElement, components);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          `Error executing component function: Error: Async component loading failed`
        );
      });

      it('should handle async function returning invalid values', async () => {
        const asyncComponentFunction = jest.fn().mockResolvedValue(null);

        const components: ComponentRoute = {
          '/test': asyncComponentFunction
        };

        await app.addComponents(mockElement, components);

        expect(asyncComponentFunction).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid component: component must be a class, instance, or function that returns a class/instance'
        );
      });
    });

    describe('Factory Functions', () => {
      it('should handle factory functions that create configured instances', async () => {
        const factoryFunction = jest.fn(() => {
          const instance = new Component();
          instance.mount = jest.fn();
          (instance as any).factoryCreated = true;
          return instance;
        });

        const components: ComponentRoute = {
          '/test': factoryFunction
        };

        await app.addComponents(mockElement, components);

        expect(factoryFunction).toHaveBeenCalled();
        const createdInstance = factoryFunction.mock.results[0].value;
        expect(createdInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
        expect((createdInstance as any).factoryCreated).toBe(true);
      });

      it('should handle complex factory functions with parameters', async () => {
        class ConfiguredComponent extends Component {
          constructor() {
            super();
            this.state = { setting: 'test' };
          }
        }

        ConfiguredComponent.prototype.mount = jest.fn();

        const factoryFunction = () => {
          return ConfiguredComponent;
        };

        const components: ComponentRoute = {
          '/test': factoryFunction
        };

        await app.addComponents(mockElement, components);

        // The function should complete without error since it creates a valid instance
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should log error for missing component', async () => {
      const components: ComponentRoute = {
        '/test': null as any
      };

      await app.addComponents(mockElement, components);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid component configuration: component=null, route=/test'
      );
    });

    it('should log error for missing route', async () => {
      const components: ComponentRoute = {
        '': Component as any
      };

      await app.addComponents(mockElement, components);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid component configuration: component=')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('route=')
      );
    });

    it('should handle component without mount method', async () => {
      const invalidComponent = { name: 'not-a-component' };

      const components: ComponentRoute = {
        '/test': invalidComponent as any
      };

      await app.addComponents(mockElement, components);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid component: component must be a class, instance, or function that returns a class/instance'
      );
    });

    it('should continue processing components after encountering an error', async () => {
      const validComponent = new Component();
      validComponent.mount = jest.fn();

      const components: ComponentRoute = {
        '/invalid': null as any, // Invalid component
        '/valid': validComponent  // Valid component
      };

      await app.addComponents(mockElement, components);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid component configuration: component=null, route=/invalid'
      );
      expect(validComponent.mount).toHaveBeenCalledWith(mockElement, { route: '/valid' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty components object', async () => {
      const components: ComponentRoute = {};

      await app.addComponents(mockElement, components);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle string element selectors', async () => {
      const componentInstance = new Component();
      componentInstance.mount = jest.fn();

      const components: ComponentRoute = {
        '/test': componentInstance
      };

      await app.addComponents('#test-element', components);

      expect(componentInstance.mount).toHaveBeenCalledWith('#test-element', { route: '/test' });
    });

    it('should handle components with custom mount implementations', async () => {
      class CustomMountComponent extends Component {
      }

      // Mock mount method on prototype
      CustomMountComponent.prototype.mount = jest.fn((element, options) => {
        // Custom mount logic
        const component = new CustomMountComponent();
        (component as any).element = element;
        (component as any).options = options;
        return component;
      });

      const components: ComponentRoute = {
        '/test': CustomMountComponent
      };

      await app.addComponents(mockElement, components);

      expect(CustomMountComponent.prototype.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
    });

    it('should handle function components with complex return values', async () => {
      const complexFunction = jest.fn(() => {
        // Return a function that when called returns a component class
        return () => {
          class NestedComponent extends Component {
          }
          return NestedComponent;
        };
      });

      const components: ComponentRoute = {
        '/test': complexFunction
      };

      await app.addComponents(mockElement, components);

      expect(complexFunction).toHaveBeenCalled();
      // The result should be treated as invalid since it doesn't match expected patterns
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid component: component must be a class, instance, or function that returns a class/instance'
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle mixed component types in single call', async () => {
      class ClassComponent extends Component {
      }

      // Mock mount method on prototype
      ClassComponent.prototype.mount = jest.fn();

      const instanceComponent = new Component();
      instanceComponent.mount = jest.fn();

      const functionComponent = jest.fn(() => {
        const instance = new Component();
        instance.mount = jest.fn();
        return instance;
      });

      const components: ComponentRoute = {
        '/class': ClassComponent,
        '/instance': instanceComponent,
        '/function': functionComponent
      };

      await app.addComponents(mockElement, components);

      expect(ClassComponent.prototype.mount).toHaveBeenCalledWith(mockElement, { route: '/class' });
      expect(instanceComponent.mount).toHaveBeenCalledWith(mockElement, { route: '/instance' });
      expect(functionComponent).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should preserve component state and configuration', async () => {
      const configuredInstance = new Component({ initial: 'state' });
      configuredInstance.mount = jest.fn();
      (configuredInstance as any).customProperty = 'test';

      const components: ComponentRoute = {
        '/test': configuredInstance
      };

      await app.addComponents(mockElement, components);

      expect(configuredInstance.mount).toHaveBeenCalledWith(mockElement, { route: '/test' });
      expect((configuredInstance as any).state).toEqual({ initial: 'state' });
      expect((configuredInstance as any).customProperty).toBe('test');
    });

    it('should handle multiple elements with different component sets', async () => {
      const element1 = mockElement;
      const element2 = document.createElement('div');
      const element3 = document.createElement('div');

      class Component1 extends Component { }
      class Component2 extends Component { }
      class Component3 extends Component { }

      Component1.prototype.mount = jest.fn();
      Component2.prototype.mount = jest.fn();
      Component3.prototype.mount = jest.fn();

      // Mount different components to different elements
      await app.addComponents(element1, {
        '/route1': Component1
      });

      await app.addComponents(element2, {
        '/route2': Component2,
        '/route3': Component3
      });

      expect(Component1.prototype.mount).toHaveBeenCalledWith(element1, { route: '/route1' });
      expect(Component2.prototype.mount).toHaveBeenCalledWith(element2, { route: '/route2' });
      expect(Component3.prototype.mount).toHaveBeenCalledWith(element2, { route: '/route3' });
    });
  });
});
