/**
 * Test file: vdom-my-skip-logic.spec.tsx
 * Purpose: Testing the skip logic functionality for preventing user interaction disruption
 * Features: Tests for focus-sensitive props, scroll preservation, and media element handling
 * Created: 2025-01-XX
 */

import { updateProps } from '../src/vdom-my-prop-attr';

describe('VDOM Skip Logic Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    // Clear any active element focus
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  describe('Focus-sensitive property skipping', () => {
    it('should skip value updates on focused input elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'original';
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // Try to update the value - should be skipped
      updateProps(input, { value: 'new value' }, false);
      expect(input.value).toBe('original');
    });

    it('should skip selectionStart updates on focused textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'hello world';
      textarea.selectionStart = 5;
      container.appendChild(textarea);

      // Focus the textarea
      textarea.focus();
      expect(document.activeElement).toBe(textarea);

      // Try to update selectionStart - should be skipped
      updateProps(textarea, { selectionStart: 0 }, false);
      expect(textarea.selectionStart).toBe(5);
    });

    it('should skip selectionEnd updates on focused input', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'hello world';
      input.selectionEnd = 5;
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // Try to update selectionEnd - should be skipped
      updateProps(input, { selectionEnd: 11 }, false);
      expect(input.selectionEnd).toBe(5);
    });

    it('should skip selectionDirection updates on focused input', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'hello world';
      input.selectionDirection = 'forward';
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // Try to update selectionDirection - should be skipped
      updateProps(input, { selectionDirection: 'backward' }, false);
      expect(input.selectionDirection).toBe('forward');
    });

    it('should allow focus-sensitive updates on unfocused elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'original';
      container.appendChild(input);

      // Ensure input is not focused
      expect(document.activeElement).not.toBe(input);

      // Update the value - should work
      updateProps(input, { value: 'new value' }, false);
      expect(input.value).toBe('new value');
    });

    it('should allow non-focus-sensitive updates on focused elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'original';
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // Update className - should work even when focused
      updateProps(input, { className: 'new-class' }, false);
      expect(input.className).toBe('new-class');
    });
  });

  describe('Scroll property preservation', () => {
    it('should skip scrollTop updates to preserve scroll position', () => {
      const div = document.createElement('div');
      div.style.height = '100px';
      div.style.overflow = 'auto';
      div.innerHTML = '<div style="height: 1000px;">Content</div>';
      div.scrollTop = 500;
      container.appendChild(div);

      // Try to update scrollTop - should be skipped
      updateProps(div, { scrollTop: 0 }, false);
      expect(div.scrollTop).toBe(500);
    });

    it('should skip scrollLeft updates to preserve scroll position', () => {
      const div = document.createElement('div');
      div.style.width = '100px';
      div.style.overflow = 'auto';
      div.innerHTML = '<div style="width: 1000px;">Content</div>';
      div.scrollLeft = 300;
      container.appendChild(div);

      // Try to update scrollLeft - should be skipped
      updateProps(div, { scrollLeft: 0 }, false);
      expect(div.scrollLeft).toBe(300);
    });

    it('should allow other property updates on scrollable elements', () => {
      const div = document.createElement('div');
      div.style.height = '100px';
      div.style.overflow = 'auto';
      div.innerHTML = '<div style="height: 1000px;">Content</div>';
      div.scrollTop = 500;
      div.className = 'original';
      container.appendChild(div);

      // Update className - should work
      updateProps(div, { className: 'new-class' }, false);
      expect(div.className).toBe('new-class');
      expect(div.scrollTop).toBe(500); // Should remain unchanged
    });
  });

  describe('Media element property preservation', () => {
    it('should skip currentTime updates on video elements', () => {
      const video = document.createElement('video');
      video.currentTime = 30;
      container.appendChild(video);

      // Try to update currentTime - should be skipped
      updateProps(video, { currentTime: 0 }, false);
      expect(video.currentTime).toBe(30);
    });

    it('should skip paused updates on audio elements', () => {
      const audio = document.createElement('audio');
      container.appendChild(audio);

      // Store original paused state
      const originalPaused = audio.paused;

      // Try to update paused - should be skipped
      updateProps(audio, { paused: !originalPaused }, false);
      expect(audio.paused).toBe(originalPaused);
    });

    it('should skip playbackRate updates on video elements', () => {
      const video = document.createElement('video');
      video.playbackRate = 1.5;
      container.appendChild(video);

      // Try to update playbackRate - should be skipped
      updateProps(video, { playbackRate: 2.0 }, false);
      expect(video.playbackRate).toBe(1.5);
    });

    it('should skip volume updates on audio elements', () => {
      const audio = document.createElement('audio');
      audio.volume = 0.8;
      container.appendChild(audio);

      // Try to update volume - should be skipped
      updateProps(audio, { volume: 0.5 }, false);
      expect(audio.volume).toBe(0.8);
    });

    it('should allow other property updates on media elements', () => {
      const video = document.createElement('video');
      video.currentTime = 30;
      video.className = 'original';
      container.appendChild(video);

      // Update className - should work
      updateProps(video, { className: 'new-class' }, false);
      expect(video.className).toBe('new-class');
      expect(video.currentTime).toBe(30); // Should remain unchanged
    });
  });

  describe('Multiple skip conditions', () => {
    it('should handle multiple skip conditions simultaneously', () => {
      const video = document.createElement('video');
      video.currentTime = 30;
      video.volume = 0.8;
      video.scrollTop = 100;
      container.appendChild(video);

      // Try to update multiple skippable properties
      updateProps(video, {
        currentTime: 0,
        volume: 0.5,
        scrollTop: 0,
        className: 'new-class'
      }, false);

      // Skip conditions should all be respected
      expect(video.currentTime).toBe(30);
      expect(video.volume).toBe(0.8);
      expect(video.scrollTop).toBe(100);
      // Non-skippable property should update
      expect(video.className).toBe('new-class');
    });

    it('should handle focus and scroll skip conditions on the same element', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'original';
      textarea.scrollTop = 50;
      container.appendChild(textarea);

      // Focus the textarea
      textarea.focus();
      expect(document.activeElement).toBe(textarea);

      // Try to update both focus-sensitive and scroll properties
      updateProps(textarea, {
        value: 'new value',
        scrollTop: 0,
        className: 'new-class'
      }, false);

      // Both skip conditions should be respected
      expect(textarea.value).toBe('original');
      expect(textarea.scrollTop).toBe(50);
      // Non-skippable property should update
      expect(textarea.className).toBe('new-class');
    });
  });

  describe('Skip logic edge cases', () => {
    it('should handle SVG elements correctly with skip logic', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      svgElement.setAttribute('x', '10');
      container.appendChild(svgElement);

      // SVG elements should not trigger skip logic (they're not HTMLElements)
      // This test verifies that skip logic only applies to HTML elements
      updateProps(svgElement, { x: '20' }, true);
      expect(svgElement.getAttribute('x')).toBe('20');
    });

    it('should handle null and undefined values gracefully', () => {
      const input = document.createElement('input');
      input.value = 'original';
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // Try to update with null/undefined - should be skipped
      updateProps(input, { value: null }, false);
      expect(input.value).toBe('original');

      updateProps(input, { value: undefined }, false);
      expect(input.value).toBe('original');
    });

    it('should handle elements that are not in the DOM', () => {
      const input = document.createElement('input');
      input.value = 'original';
      // Don't append to container - element not in DOM

      // Focus won't work on detached element, but skip logic should handle gracefully
      updateProps(input, { value: 'new value' }, false);
      expect(input.value).toBe('new value');
    });
  });

  describe('Performance considerations', () => {
    it('should not significantly impact performance with skip checks', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      const start = performance.now();

      // Run many updates that don't trigger skip conditions
      for (let i = 0; i < 1000; i++) {
        updateProps(div, { className: `class-${i}` }, false);
      }

      const end = performance.now();
      const duration = end - start;

      // Performance should be reasonable (less than 100ms for 1000 updates)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Property merging with skip logic', () => {
    it('should merge properties correctly when some are skipped', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'original';
      input.className = 'original-class';
      container.appendChild(input);

      // Focus the input
      input.focus();
      expect(document.activeElement).toBe(input);

      // First update: set initial props
      updateProps(input, {
        value: 'first-value',
        className: 'first-class',
        'data-test': 'first'
      }, false);

      // value should be skipped, others should apply
      expect(input.value).toBe('original');
      expect(input.className).toBe('first-class');
      expect(input.getAttribute('data-test')).toBe('first');

      // Second update: merge with new props
      updateProps(input, {
        value: 'second-value',
        className: 'second-class',
        'data-test': 'second',
        placeholder: 'Enter text'
      }, false);

      // value should still be skipped, others should update
      expect(input.value).toBe('original');
      expect(input.className).toBe('second-class');
      expect(input.getAttribute('data-test')).toBe('second');
      expect(input.placeholder).toBe('Enter text');
    });

    it('should handle cached props correctly with skip logic', () => {
      const div = document.createElement('div');
      div.scrollTop = 100;
      container.appendChild(div);

      // First update
      updateProps(div, {
        scrollTop: 0,
        className: 'first-class'
      }, false);

      // scrollTop should be skipped, className should apply
      expect(div.scrollTop).toBe(100);
      expect(div.className).toBe('first-class');

      // Second update with partial props
      updateProps(div, {
        className: 'second-class'
      }, false);

      // scrollTop should still be preserved, className should update
      expect(div.scrollTop).toBe(100);
      expect(div.className).toBe('second-class');
    });
  });
});
