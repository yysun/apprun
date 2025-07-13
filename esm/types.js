/**
 * Core TypeScript Type Definitions
 *
 * This file defines the fundamental types used across AppRun:
 * 1. Component Types
 *    - View: Function that renders state to VDOM
 *    - Action: Function that updates state (sync/async)
 *    - Update: Collection of actions (array or object format)
 *    - ActionDef: Tuple definition for action arrays
 *
 * 2. Virtual DOM Types
 *    - VNode: Virtual DOM node structure with tag/props/children
 *    - VDOM: Union of possible VDOM types (false, string, VNode, array)
 *    - Element: DOM element references (HTMLElement or string selector)
 *    - TemplateResult: Lit-html template support
 *
 * 3. Configuration Types
 *    - EventOptions: Event handler options (once, delay, transition)
 *    - ActionOptions: Action behavior options (render, history, global, callback)
 *    - MountOptions: Component mounting options (global events, routing, transitions)
 *    - AppStartOptions: Application startup configuration with lifecycle hooks
 *
 * Features:
 * - Strong typing for component lifecycle
 * - Flexible action definition formats
 * - Comprehensive event options
 * - Integration with external libraries (lit-html)
 * - Type-safe component mounting
 * - Lifecycle hook typing
 *
 * Type Safety Improvements (v3.35.1):
 * - Enhanced generic constraints for better type inference
 * - Improved union types for VDOM flexibility
 * - Better callback typing in options
 * - Stricter typing for lifecycle methods
 *
 * Usage:
 * ```ts
 * class MyComponent extends Component<State, Events> {
 *   view: View<State>;
 *   update: Update<State, Events>;
 * }
 *
 * // Type-safe action definitions
 * const update: Update<State> = {
 *   'event': (state: State, ...args) => newState
 * };
 * ```
 */
export {};
//# sourceMappingURL=types.js.map