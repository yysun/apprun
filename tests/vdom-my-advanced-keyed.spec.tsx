import { createElement, updateElement } from '../src/vdom-my';

describe('Advanced Keyed Reconciliation Tests', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const render = (vdom) => {
    updateElement(container, vdom);
    return container.firstChild as HTMLElement;
  };

  describe('Element Reuse and State Preservation', () => {
    it('should preserve DOM state during key-based reordering', () => {
      // Initial render
      let element = render(createElement('ul', null, [
        createElement('li', { key: 'first' }, [
          createElement('input', { type: 'text', value: 'input1' })
        ]),
        createElement('li', { key: 'second' }, [
          createElement('input', { type: 'text', value: 'input2' })
        ]),
        createElement('li', { key: 'third' }, [
          createElement('input', { type: 'text', value: 'input3' })
        ])
      ]));

      // Add custom properties to track element identity
      const inputs = element.querySelectorAll('input');
      (inputs[0] as any).testId = 'first-input';
      (inputs[1] as any).testId = 'second-input';
      (inputs[2] as any).testId = 'third-input';

      // Reorder elements
      element = render(createElement('ul', null, [
        createElement('li', { key: 'third' }, [
          createElement('input', { type: 'text', value: 'input3-updated' })
        ]),
        createElement('li', { key: 'first' }, [
          createElement('input', { type: 'text', value: 'input1-updated' })
        ]),
        createElement('li', { key: 'second' }, [
          createElement('input', { type: 'text', value: 'input2-updated' })
        ])
      ]));

      // Verify reordering worked
      expect(element.children.length).toBe(3);
      const reorderedInputs = element.querySelectorAll('input');

      // First input should now be the third one
      expect((reorderedInputs[0] as any).testId).toBe('third-input');
      expect(reorderedInputs[0].value).toBe('input3-updated');

      // Second input should now be the first one
      expect((reorderedInputs[1] as any).testId).toBe('first-input');
      expect(reorderedInputs[1].value).toBe('input1-updated');

      // Third input should now be the second one
      expect((reorderedInputs[2] as any).testId).toBe('second-input');
      expect(reorderedInputs[2].value).toBe('input2-updated');
    });

    it('should handle adding and removing keyed elements efficiently', () => {
      // Initial render with 3 elements
      let element = render(createElement('div', null, [
        createElement('span', { key: 'a' }, 'Item A'),
        createElement('span', { key: 'b' }, 'Item B'),
        createElement('span', { key: 'c' }, 'Item C')
      ]));

      // Mark elements for tracking
      Array.from(element.children).forEach((child, i) => {
        (child as any).originalIndex = i;
      });

      // Remove middle element and add new ones
      element = render(createElement('div', null, [
        createElement('span', { key: 'a' }, 'Item A Updated'),
        createElement('span', { key: 'd' }, 'Item D'), // New
        createElement('span', { key: 'c' }, 'Item C Updated'),
        createElement('span', { key: 'e' }, 'Item E')  // New
      ]));

      expect(element.children.length).toBe(4);

      // First element should be reused (key 'a')
      expect((element.children[0] as any).originalIndex).toBe(0);
      expect(element.children[0].textContent).toBe('Item A Updated');

      // Second element should be new (key 'd')
      expect((element.children[1] as any).originalIndex).toBeUndefined();
      expect(element.children[1].textContent).toBe('Item D');

      // Third element should be reused (key 'c')
      expect((element.children[2] as any).originalIndex).toBe(2);
      expect(element.children[2].textContent).toBe('Item C Updated');

      // Fourth element should be new (key 'e')
      expect((element.children[3] as any).originalIndex).toBeUndefined();
      expect(element.children[3].textContent).toBe('Item E');
    });
  });

  describe('Mixed Keyed/Unkeyed Children', () => {
    it('should handle mix of keyed and unkeyed elements correctly', () => {
      const element = render(createElement('div', null, [
        createElement('span', null, 'Unkeyed 1'),
        createElement('span', { key: 'keyed-middle' }, 'Keyed Middle'),
        createElement('span', null, 'Unkeyed 2'),
        createElement('span', { key: 'keyed-end' }, 'Keyed End')
      ]));

      expect(element.children.length).toBe(4);
      expect(element.children[0].textContent).toBe('Unkeyed 1');
      expect(element.children[1].textContent).toBe('Keyed Middle');
      expect(element.children[2].textContent).toBe('Unkeyed 2');
      expect(element.children[3].textContent).toBe('Keyed End');

      // Track keyed elements
      (element.children[1] as any).keyedId = 'middle';
      (element.children[3] as any).keyedId = 'end';

      // Update with reordering
      render(createElement('div', null, [
        createElement('span', { key: 'keyed-end' }, 'Keyed End Updated'),
        createElement('span', null, 'New Unkeyed 1'),
        createElement('span', { key: 'keyed-middle' }, 'Keyed Middle Updated'),
        createElement('span', null, 'New Unkeyed 2')
      ]));

      // Keyed elements should maintain identity
      expect((element.children[0] as any).keyedId).toBe('end');
      expect(element.children[0].textContent).toBe('Keyed End Updated');

      expect((element.children[2] as any).keyedId).toBe('middle');
      expect(element.children[2].textContent).toBe('Keyed Middle Updated');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle dynamic key changes gracefully', () => {
      // Start with one set of keys
      let element = render(createElement('div', null, [
        createElement('span', { key: 'dynamic-1' }, 'Content 1'),
        createElement('span', { key: 'dynamic-2' }, 'Content 2')
      ]));

      // Change keys completely (should create new elements)
      element = render(createElement('div', null, [
        createElement('span', { key: 'new-1' }, 'New Content 1'),
        createElement('span', { key: 'new-2' }, 'New Content 2')
      ]));

      expect(element.children.length).toBe(2);
      expect(element.children[0].textContent).toBe('New Content 1');
      expect(element.children[1].textContent).toBe('New Content 2');
    });

    it('should handle empty string and numeric keys', () => {
      const element = render(createElement('div', null, [
        createElement('span', { key: '' }, 'Empty Key'),
        createElement('span', { key: 0 }, 'Zero Key'),
        createElement('span', { key: '0' }, 'String Zero Key'),
        createElement('span', { key: 1 }, 'One Key')
      ]));

      expect(element.children.length).toBe(4);
      expect(element.children[0].textContent).toBe('Empty Key');
      expect(element.children[1].textContent).toBe('Zero Key');
      expect(element.children[2].textContent).toBe('String Zero Key');
      expect(element.children[3].textContent).toBe('One Key');
    });

    it('should handle large lists efficiently', () => {
      const start = performance.now();

      // Create large list
      const items = Array.from({ length: 1000 }, (_, i) =>
        createElement('div', { key: `item-${i}` }, `Item ${i}`)
      );

      let element = render(createElement('div', null, items));

      // Reverse the list (worst case for naive algorithms)
      const reversedItems = items.slice().reverse();
      element = render(createElement('div', null, reversedItems));

      const end = performance.now();
      const duration = end - start;

      expect(element.children.length).toBe(1000);
      expect(element.children[0].textContent).toBe('Item 999');
      expect(element.children[999].textContent).toBe('Item 0');

      // Should complete in reasonable time (less than 200ms for 1000 element reverse)
      expect(duration).toBeLessThan(200);
    });

    it('should handle deeply nested keyed structures', () => {
      const createNestedStructure = (depth: number, keyPrefix: string): any => {
        if (depth === 0) {
          return createElement('span', { key: `${keyPrefix}-leaf` }, `Leaf ${keyPrefix}`);
        }

        return createElement('div', { key: `${keyPrefix}-${depth}` }, [
          createNestedStructure(depth - 1, `${keyPrefix}-a`),
          createNestedStructure(depth - 1, `${keyPrefix}-b`)
        ]);
      };

      const element = render(createNestedStructure(5, 'root'));

      // Verify nested structure
      expect(element.tagName).toBe('DIV');
      expect(element.children.length).toBe(2);

      // Check that deep leaves are rendered
      const leaves = element.querySelectorAll('span');
      expect(leaves.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Characteristics', () => {
    it('should reuse elements efficiently during partial updates', () => {
      // Create initial list
      const initialItems = Array.from({ length: 100 }, (_, i) =>
        createElement('div', { key: i }, `Item ${i}`)
      );

      let element = render(createElement('div', null, initialItems));

      // Mark all elements for tracking
      Array.from(element.children).forEach((child, i) => {
        (child as any).originalIndex = i;
      });

      // Update only some items (should reuse most elements)
      const updatedItems = Array.from({ length: 100 }, (_, i) => {
        if (i % 10 === 0) {
          return createElement('div', { key: i }, `Updated Item ${i}`);
        }
        return createElement('div', { key: i }, `Item ${i}`);
      });

      element = render(createElement('div', null, updatedItems));

      // Count reused elements
      let reusedCount = 0;
      Array.from(element.children).forEach((child, i) => {
        if ((child as any).originalIndex === i) {
          reusedCount++;
        }
      });

      // Should reuse majority of elements (at least 80%)
      expect(reusedCount).toBeGreaterThan(80);
    });
  });
});
