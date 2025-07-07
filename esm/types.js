/**
 * Core TypeScript Type Definitions
 *
 * This file defines the fundamental types used across AppRun:
 * 1. Component Types
 *    - View: Function that renders state to VDOM
 *    - Action: Function that updates state
 *    - Update: Collection of actions
 *
 * 2. Virtual DOM Types
 *    - VNode: Virtual DOM node structure
 *    - VDOM: Union of possible VDOM types
 *    - Element: DOM element references
 *
 * 3. Configuration Types
 *    - EventOptions: Event handler options (once, delay, etc)
 *    - ActionOptions: Action behavior options (render, history, etc)
 *    - MountOptions: Component mounting options (global events, routing)
 *    - AppStartOptions: Application startup configuration
 *
 * Usage:
 * ```ts
 * class MyComponent implements Component<State> {
 *   view: View<State>;
 *   update: Update<State>;
 * }
 * ```
 */
export {};
//# sourceMappingURL=types.js.map