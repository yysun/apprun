import { createElement, updateElement } from '../src/vdom-my';

describe('VDOM Active Element Protection Tests', () => {
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

  describe('Input Element Protection', () => {
    it('should preserve input value and selection when element is focused', (done) => {
      // Render input
      const element = render(createElement('input', {
        type: 'text',
        value: 'initial value',
        id: 'test-input'
      }));

      const input = element as HTMLInputElement;

      // Focus the input and modify its value/selection
      input.focus();
      input.value = 'user typed text';
      input.setSelectionRange(5, 10);

      // Verify the input is focused and has our values
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('user typed text');
      expect(input.selectionStart).toBe(5);
      expect(input.selectionEnd).toBe(10);

      // Use setTimeout to ensure focus state is preserved during render
      setTimeout(() => {
        // Re-render with different props (this should trigger property reset)
        render(createElement('input', {
          type: 'text',
          value: 'updated value',
          id: 'test-input',
          className: 'updated-class'
        }));

        // Values should be preserved because element is focused
        expect(input.value).toBe('user typed text'); // Protected
        expect(input.selectionStart).toBe(5); // Protected
        expect(input.selectionEnd).toBe(10); // Protected
        expect(input.className).toBe('updated-class'); // Updated

        done();
      }, 10);
    });

    it('should reset input value when element is not focused', () => {
      // Render input
      const element = render(createElement('input', {
        type: 'text',
        value: 'initial value'
      }));

      const input = element as HTMLInputElement;

      // Modify value but don't focus
      input.value = 'modified value';
      expect(input.value).toBe('modified value');

      // Re-render - should reset value since not focused
      render(createElement('input', {
        type: 'text',
        value: 'new value',
        className: 'new-class'
      }));

      expect(input.value).toBe('new value'); // Should be updated
      expect(input.className).toBe('new-class');
    });

    it('should preserve checkbox checked state', () => {
      // Render checkbox
      const element = render(createElement('input', {
        type: 'checkbox',
        checked: false
      }));

      const checkbox = element as HTMLInputElement;

      // Check the checkbox
      checkbox.checked = true;
      expect(checkbox.checked).toBe(true);

      // Re-render - should preserve checked state
      render(createElement('input', {
        type: 'checkbox',
        checked: false, // This should be ignored
        className: 'updated'
      }));

      expect(checkbox.checked).toBe(true); // Protected
      expect(checkbox.className).toBe('updated'); // Updated
    });
  });

  describe('Textarea Element Protection', () => {
    it('should preserve textarea value and selection when focused', (done) => {
      // Render textarea
      const element = render(createElement('textarea', {
        value: 'initial content'
      }));

      const textarea = element as HTMLTextAreaElement;

      // Focus and modify
      textarea.focus();
      textarea.value = 'user typed content';
      textarea.setSelectionRange(3, 8);

      expect(document.activeElement).toBe(textarea);

      setTimeout(() => {
        // Re-render
        render(createElement('textarea', {
          value: 'new content',
          className: 'updated'
        }));

        // Should preserve user content and selection
        expect(textarea.value).toBe('user typed content'); // Protected
        expect(textarea.selectionStart).toBe(3); // Protected
        expect(textarea.selectionEnd).toBe(8); // Protected
        expect(textarea.className).toBe('updated'); // Updated

        done();
      }, 10);
    });
  });

  describe('Select Element Protection', () => {
    it('should preserve select value and selectedIndex', () => {
      // Render select
      const element = render(createElement('select', {}, [
        createElement('option', { value: 'a' }, 'Option A'),
        createElement('option', { value: 'b' }, 'Option B'),
        createElement('option', { value: 'c' }, 'Option C')
      ]));

      const select = element as HTMLSelectElement;

      // Change selection
      select.selectedIndex = 2;
      expect(select.value).toBe('c');
      expect(select.selectedIndex).toBe(2);

      // Re-render with different selectedIndex
      render(createElement('select', { selectedIndex: 0, className: 'updated' }, [
        createElement('option', { value: 'a' }, 'Option A'),
        createElement('option', { value: 'b' }, 'Option B'),
        createElement('option', { value: 'c' }, 'Option C')
      ]));

      // Should preserve user selection
      expect(select.selectedIndex).toBe(2); // Protected
      expect(select.value).toBe('c'); // Protected
      expect(select.className).toBe('updated'); // Updated
    });
  });

  describe('Scroll Position Protection', () => {
    it('should preserve scroll position during updates', () => {
      // Create a scrollable div with content
      const element = render(createElement('div', {
        style: 'height: 100px; overflow: auto; width: 100px;'
      }, [
        createElement('div', { style: 'height: 500px; width: 200px;' }, 'Large content')
      ]));

      // Scroll the element
      element.scrollTop = 50;
      element.scrollLeft = 25;
      expect(element.scrollTop).toBe(50);
      expect(element.scrollLeft).toBe(25);

      // Re-render with updated content
      render(createElement('div', {
        style: 'height: 100px; overflow: auto; width: 100px;',
        className: 'updated'
      }, [
        createElement('div', { style: 'height: 500px; width: 200px;' }, 'Updated large content')
      ]));

      // Should preserve scroll position
      expect(element.scrollTop).toBe(50); // Protected
      expect(element.scrollLeft).toBe(25); // Protected
      expect(element.className).toBe('updated'); // Updated
    });
  });

  describe('Non-Interactive Element Behavior', () => {
    it('should reset properties for non-interactive elements normally', () => {
      // Render a div
      const element = render(createElement('div', {
        className: 'initial',
        id: 'test'
      }, 'Content'));

      expect(element.className).toBe('initial');
      expect(element.id).toBe('test');

      // Re-render with different props
      render(createElement('div', {
        className: 'updated'
      }, 'New Content'));

      // Should reset and apply new properties
      expect(element.className).toBe('updated');
      expect(element.id).toBe(''); // Should be reset
      expect(element.textContent).toBe('New Content');
    });
  });

  describe('Complex UX Scenarios', () => {
    it('should handle rapid typing during frequent re-renders', (done) => {
      const element = render(createElement('input', {
        type: 'text',
        value: 'initial',
        id: 'rapid-typing'
      }));

      const input = element as HTMLInputElement;
      input.focus();

      // Simulate rapid typing
      let typingStep = 0;
      const userText = ['h', 'he', 'hel', 'hell', 'hello'];

      const simulateTyping = () => {
        if (typingStep < userText.length) {
          input.value = userText[typingStep];
          input.setSelectionRange(userText[typingStep].length, userText[typingStep].length);

          // Re-render while user is typing
          render(createElement('input', {
            type: 'text',
            value: 'should-be-ignored',
            id: 'rapid-typing',
            'data-step': typingStep
          }));

          // Verify user input is preserved
          expect(input.value).toBe(userText[typingStep]);
          expect(input.selectionStart).toBe(userText[typingStep].length);

          typingStep++;
          setTimeout(simulateTyping, 10);
        } else {
          // Final verification
          expect(input.value).toBe('hello');
          done();
        }
      };

      setTimeout(simulateTyping, 10);
    });

    it('should handle focus changes during updates', () => {
      // Create two inputs
      const container = render(createElement('div', {}, [
        createElement('input', { type: 'text', id: 'input1', value: 'first' }),
        createElement('input', { type: 'text', id: 'input2', value: 'second' })
      ]));

      const input1 = container.querySelector('#input1') as HTMLInputElement;
      const input2 = container.querySelector('#input2') as HTMLInputElement;

      // Focus first input and modify
      input1.focus();
      input1.value = 'user content 1';
      input1.setSelectionRange(5, 10);

      // Re-render - first input should be protected, second should update
      render(createElement('div', {}, [
        createElement('input', { type: 'text', id: 'input1', value: 'new first' }),
        createElement('input', { type: 'text', id: 'input2', value: 'new second' })
      ]));

      expect(input1.value).toBe('user content 1'); // Protected (focused)
      expect(input1.selectionStart).toBe(5); // Protected
      expect(input1.selectionEnd).toBe(10); // Protected
      expect(input2.value).toBe('new second'); // Updated (not focused)

      // Now focus the second input
      input2.focus();
      input2.value = 'user content 2';

      // Re-render again
      render(createElement('div', {}, [
        createElement('input', { type: 'text', id: 'input1', value: 'newer first' }),
        createElement('input', { type: 'text', id: 'input2', value: 'newer second' })
      ]));

      expect(input1.value).toBe('newer first'); // Updated (no longer focused)
      expect(input2.value).toBe('user content 2'); // Protected (now focused)
    });

    it('should preserve scroll during complex list updates', () => {
      // Create scrollable list
      const items = Array.from({ length: 50 }, (_, i) =>
        createElement('div', { key: i, style: 'height: 20px;' }, `Item ${i}`)
      );

      const element = render(createElement('div', {
        style: 'height: 100px; overflow: auto;'
      }, items));

      // Scroll down
      element.scrollTop = 300;
      expect(element.scrollTop).toBe(300);

      // Re-render with reordered items (complex update)
      const reorderedItems = [...items].reverse();
      render(createElement('div', {
        style: 'height: 100px; overflow: auto;',
        'data-updated': true
      }, reorderedItems));

      // Scroll should be preserved
      expect(element.scrollTop).toBe(300);
      expect(element.dataset.updated).toBe('true');
    });

    it('should handle form submission scenarios', () => {
      // Create form with various input types
      const element = render(createElement('form', {}, [
        createElement('input', { type: 'text', name: 'username', value: 'initial' }),
        createElement('input', { type: 'email', name: 'email', value: 'test@example.com' }),
        createElement('input', { type: 'checkbox', name: 'terms', checked: false }),
        createElement('textarea', { name: 'message', value: 'initial message' })
      ]));

      const username = element.querySelector('[name="username"]') as HTMLInputElement;
      const email = element.querySelector('[name="email"]') as HTMLInputElement;
      const terms = element.querySelector('[name="terms"]') as HTMLInputElement;
      const message = element.querySelector('[name="message"]') as HTMLTextAreaElement;

      // User fills out form
      username.focus();
      username.value = 'johndoe';
      terms.checked = true;

      // Form validation triggers re-render
      render(createElement('form', { 'data-validated': true }, [
        createElement('input', { type: 'text', name: 'username', value: 'should-be-ignored' }),
        createElement('input', { type: 'email', name: 'email', value: 'should-be-ignored' }),
        createElement('input', { type: 'checkbox', name: 'terms', checked: false }),
        createElement('textarea', { name: 'message', value: 'should-be-ignored' })
      ]));

      // User input should be preserved
      expect(username.value).toBe('johndoe'); // Protected (focused)
      expect(terms.checked).toBe(true); // Protected (checkbox state)
      expect(email.value).toBe('should-be-ignored'); // Updated (not focused)
      expect(message.value).toBe('should-be-ignored'); // Updated (not focused)
      expect(element.dataset.validated).toBe('true');
    });

    it('should handle contenteditable elements', () => {
      const element = render(createElement('div', {
        contenteditable: 'true',
        style: 'min-height: 50px; border: 1px solid black;'
      }, 'Initial content'));

      // Focus and modify content
      element.focus();
      element.textContent = 'User edited content';

      // Re-render
      render(createElement('div', {
        contenteditable: 'true',
        style: 'min-height: 50px; border: 1px solid black;',
        'data-updated': true
      }, 'Should be ignored'));

      // For contenteditable, we currently don't protect the content
      // This test documents current behavior
      expect(element.textContent).toBe('Should be ignored');
      expect(element.dataset.updated).toBe('true');
    });
  });
});
