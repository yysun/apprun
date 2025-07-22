/**
 * SVUComponent - SVU architecture demonstration with text input handling
 * Features: Demonstrates SVU architecture with text input handling
 * Implementation: Object state with input event handling and Enter key support
 */
import { Component, html } from '../../../dist/apprun-html.esm.js'; 

const state = { message: 'Hello from SVU!' };

const view = (state) => html`
  <div>
    <h2>State-view-update Pattern Demo</h2>
    <p>${state.message}</p>
    <input type="text" 
            placeholder="Enter new message" 
            @input=${run('update-message')} />
    <div style="margin-top: 15px;">
      <small>State → View (html) → Update (events) → Component</small>
    </div>
    <pre>
'/svu': new Component(state, view, update),
    </pre>
  </div>
`;

const update = {
  'update-message': (state, e) => ({ ...state, message: e.target.value || 'Hello from SVU!' })
};

export const SVUComponent = new Component(state, view, update, {global_event: true});
