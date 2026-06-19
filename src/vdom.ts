/**
 * Virtual DOM Implementation
 * 
 * This file provides the core virtual DOM functionality:
 * 1. createElement: Creates virtual DOM nodes
 * 2. Fragment: Support for fragments
 * 3. render: Renders virtual DOM to real DOM
 * 4. trustedHTML: Parses caller-owned trusted HTML strings
 * 
 * The virtual DOM system:
 * - Provides efficient DOM updates
 * - Supports JSX compilation
 * - Handles component rendering
 * - Manages DOM diffing and patching
 * 
 * Usage:
 * ```ts
 * // JSX gets compiled to createElement calls
 * const vdom = <div id="app">Hello</div>;
 * 
 * // Render to DOM
 * render(document.body, vdom);
 * ```
 */

import { createElement, updateElement, Fragment, trustedHTML, safeHTML } from './vdom-my';
export { createElement, Fragment, updateElement as render, trustedHTML, safeHTML };
export { createElement as jsx, createElement as jsxs };
