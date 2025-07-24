import app, { Component, on, event } from '../src/apprun';
import directive from '../src/directive';

describe('Directive', () => {
  it('should apply $on', () => {
    let vdom = {
      tag: 'div',
      props: {
        "$onclick": 'a'
      }
    };
    vdom = directive(vdom, {});
    expect(vdom.props['$onclick']).toBeUndefined();
    expect(vdom.props['onclick']).not.toBeUndefined();

    let vdom2 = [{
      tag: 'div',
      props: {
        "$onclick": 'a'
      }
    }];

    vdom = directive(vdom2, {});
    expect(vdom[0].props['$onclick']).toBeUndefined();
    expect(vdom[0].props['onclick']).not.toBeUndefined();

    let vdom3 = [{
      tag: 'div',
      props: null,
      children: [{
        tag: 'div',
        props: {
          "$onclick": 'a'
        }
      }]
    }];

    vdom = directive(vdom3, {});
    expect(vdom[0].children[0].props['$onclick']).toBeUndefined();
    expect(vdom[0].children[0].props['onclick']).not.toBeUndefined();
  });

  it('should trigger event - $on', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <>
        <button id='b1' $onclick />
        <button id='b2' $onclick='+2' />
        <button id='b3' $onclick='#2' />
      </>

      @on()
      onclick = state => state + 1;

      @event('+2, #2')
      add2(state) {
        return state + 2;
      }
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b1').click();
    expect(component.state).toBe(1);
    document.getElementById('b2').click();
    expect(component.state).toBe(3);
    document.getElementById('b3').click();
    expect(component.state).toBe(5);
  });

  it('should trigger event - $on to function', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b4' $onclick={this.add2} />

      add2(state) {
        return state + 2;
      }
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b4').click();
    expect(component.state).toBe(2);
  });

  it('should trigger event - $on to function that returns Promise', (done) => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <>
        <button id='b5' $onclick={[this.add, 3]} />
        <button id='b6' $onclick={[this.addPromise, 3]} />
      </>
      addPromise = (state, n) => new Promise((r) => r(state + n));
      add = (state, n) => state + n;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b5').click();
    document.getElementById('b6').click();
    setTimeout(() => {
      expect(component.state).toBe(6);
      done();
    }, 0)
  });

  it('should trigger event - $on [function ...]', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b7' $onclick={[this.add, 3]} />

      add = (state, num) => state + num;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b7').click();
    expect(component.state).toBe(3);
  });

  it('should trigger event - $on [event: string ...]', () => {
    class Test extends Component {
      state = 0;
      // prettier-ignore
      view = () => <button id='b8' $onclick={['add', 3]} />

      @on() add = (state, num) => state + num;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    expect(component.state).toBe(0);
    document.getElementById('b8').click();
    expect(component.state).toBe(3);
  });

  it('should bind input to state - $bind', () => {
    class Test extends Component {
      state = {
        a: 'a',
        b: 'b',
        c: 5,
        d: true,
        e: 'A',
        f: 5,
        h: 'v2',
        o1: false,
        o2: true,
        o3: false
      };

      // prettier-ignore
      view = state => <>
        <input $bind />
        <input $bind name='a' />
        <input $bind='b' />
        <input type='number' name='c' $bind />
        <input type='checkbox' name='d' $bind />
        <input type='radio' name='e' value='A' $bind />
        <input type='radio' name='e' value='B' $bind />
        <input type='range' min='0' max='5' name='f' $bind />
        <select $bind name='h'>
          <option value='v1'>1</option>
          <option value='v2'>2</option>
          <option value='v3'>3</option>
        </select>
        <select multiple name='i'>
          <option $bind='o1'>1</option>
          <option $bind='o2'>2</option>
          <option $bind='o3'>3</option>
        </select>
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;
    const inputs = document.querySelectorAll('input');

    expect(inputs[1].value).toBe('a');
    inputs[1].value = '1';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.a).toBe('1');

    expect(inputs[2].value).toBe('b');
    inputs[2].value = '2';
    inputs[2].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.b).toBe('2');

    expect(inputs[3].value).toBe('5');
    inputs[3].value = '3';
    inputs[3].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.c).toBe(3);

    expect(inputs[4].checked).toBeTruthy();
    inputs[4].click();
    expect(component.state.d).toBeFalsy();
    inputs[4].click();
    expect(component.state.d).toBeTruthy();

    expect(inputs[5].checked).toBeTruthy();
    inputs[5].click();
    expect(component.state.e).toBe('A');
    expect(inputs[6].checked).toBeFalsy();
    inputs[6].click();
    expect(component.state.e).toBe('B');

    expect(inputs[7].value).toBe('5');
    inputs[7].value = '4';
    inputs[7].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.f).toBe(4);

    const select = document.querySelector('select');
    expect(select.selectedIndex).toBe(1);
    select.value = 'v3';
    select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    expect(component.state.h).toBe('v3');

    const options = document.querySelectorAll('option');
    // expect(options[1].selected).toBeTruthy();
    expect(options[4].selected).toBeTruthy();

    options[4].selected = true;
    options[4].dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    expect(component.state.o2).toBeTruthy();

    inputs[0].value = '0';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state).toBe('0');
  });

  it('should use directive in app.render', () => {
    let show = false;
    app.on('$', ({ key, props }) => {
      if (key === '$show') {
        show = true;
      }
    });
    const View = () => <>
      <button id='bx' $show />
    </>
    app.render(document.body, View());
    expect(show).toBeTruthy();
  });

  it('should trigger $on in app.render to app.run', () => {
    let show = false;
    app.on('11', () => {
        show = true;
    });

    const View = () => <>
      <button id='bx' $onclick='11' />
    </>
    app.render(document.body, View());
    document.getElementById('bx').click();
    expect(show).toBeTruthy();
  });

  it('should bind nested object properties - $bind', () => {
    class Test extends Component {
      state = {
        user: {
          name: 'John',
          profile: {
            age: 25,
            settings: {
              theme: 'dark'
            }
          }
        }
      };

      // prettier-ignore
      view = state => <>
        <input id='userName' $bind='user.name' />
        <input id='userAge' type='number' $bind='user.profile.age' />
        <input id='userTheme' $bind='user.profile.settings.theme' />
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const userNameInput = document.getElementById('userName') as HTMLInputElement;
    const userAgeInput = document.getElementById('userAge') as HTMLInputElement;
    const userThemeInput = document.getElementById('userTheme') as HTMLInputElement;

    // Check initial values
    expect(userNameInput.value).toBe('John');
    expect(userAgeInput.value).toBe('25');
    expect(userThemeInput.value).toBe('dark');

    // Test updating nested string property
    userNameInput.value = 'Jane';
    userNameInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.user.name).toBe('Jane');
    expect(component.state.user.profile.age).toBe(25); // Other properties should remain unchanged

    // Test updating nested number property
    userAgeInput.value = '30';
    userAgeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.user.profile.age).toBe(30);
    expect(component.state.user.name).toBe('Jane'); // Other properties should remain unchanged

    // Test updating deeply nested property
    userThemeInput.value = 'light';
    userThemeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.user.profile.settings.theme).toBe('light');
    expect(component.state.user.profile.age).toBe(30); // Other properties should remain unchanged
  });

  it('should bind array elements - $bind', () => {
    class Test extends Component {
      state = {
        items: ['apple', 'banana', 'cherry'],
        numbers: [1, 2, 3]
      };

      // prettier-ignore
      view = state => <>
        <input id='item0' $bind='items[0]' />
        <input id='item1' $bind='items[1]' />
        <input id='number0' type='number' $bind='numbers[0]' />
        <input id='number2' type='number' $bind='numbers[2]' />
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const item0Input = document.getElementById('item0') as HTMLInputElement;
    const item1Input = document.getElementById('item1') as HTMLInputElement;
    const number0Input = document.getElementById('number0') as HTMLInputElement;
    const number2Input = document.getElementById('number2') as HTMLInputElement;

    // Check initial values
    expect(item0Input.value).toBe('apple');
    expect(item1Input.value).toBe('banana');
    expect(number0Input.value).toBe('1');
    expect(number2Input.value).toBe('3');

    // Test updating array elements
    item0Input.value = 'orange';
    item0Input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.items[0]).toBe('orange');
    expect(component.state.items[1]).toBe('banana'); // Other elements should remain unchanged

    // Test updating number array elements
    number0Input.value = '10';
    number0Input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.numbers[0]).toBe(10);
    expect(component.state.numbers[2]).toBe(3); // Other elements should remain unchanged
  });

  it('should bind mixed nested paths - $bind', () => {
    class Test extends Component {
      state = {
        users: [
          { name: 'John', settings: { theme: 'dark' } },
          { name: 'Jane', settings: { theme: 'light' } }
        ]
      };

      // prettier-ignore
      view = state => <>
        <input id='user0Name' $bind='users[0].name' />
        <input id='user0Theme' $bind='users[0].settings.theme' />
        <input id='user1Name' $bind='users[1].name' />
        <input id='user1Theme' $bind='users[1].settings.theme' />
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const user0NameInput = document.getElementById('user0Name') as HTMLInputElement;
    const user0ThemeInput = document.getElementById('user0Theme') as HTMLInputElement;
    const user1NameInput = document.getElementById('user1Name') as HTMLInputElement;
    const user1ThemeInput = document.getElementById('user1Theme') as HTMLInputElement;

    // Check initial values
    expect(user0NameInput.value).toBe('John');
    expect(user0ThemeInput.value).toBe('dark');
    expect(user1NameInput.value).toBe('Jane');
    expect(user1ThemeInput.value).toBe('light');

    // Test updating mixed nested path
    user0NameInput.value = 'Johnny';
    user0NameInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.users[0].name).toBe('Johnny');
    expect(component.state.users[0].settings.theme).toBe('dark'); // Other properties should remain unchanged
    expect(component.state.users[1].name).toBe('Jane'); // Other array elements should remain unchanged

    // Test updating deeply nested mixed path
    user0ThemeInput.value = 'blue';
    user0ThemeInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.users[0].settings.theme).toBe('blue');
    expect(component.state.users[0].name).toBe('Johnny'); // Other properties should remain unchanged
    expect(component.state.users[1].settings.theme).toBe('light'); // Other array elements should remain unchanged
  });

  it('should handle non-existent nested paths gracefully - $bind', () => {
    class Test extends Component {
      state = {
        existing: 'value'
      };

      // prettier-ignore
      view = state => <>
        <input id='nonExistent' $bind='missing.path' />
        <input id='missingArray' $bind='missing[0].value' />
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const nonExistentInput = document.getElementById('nonExistent') as HTMLInputElement;
    const missingArrayInput = document.getElementById('missingArray') as HTMLInputElement;

    // Should show empty values for non-existent paths
    expect(nonExistentInput.value).toBe('');
    expect(missingArrayInput.value).toBe('');

    // Should create nested structure when setting values
    nonExistentInput.value = 'new value';
    nonExistentInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.missing.path).toBe('new value');
    expect(component.state.existing).toBe('value'); // Existing properties should remain unchanged

    // Should create mixed nested structure
    missingArrayInput.value = 'array value';
    missingArrayInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    expect(component.state.missing[0].value).toBe('array value');
    expect(component.state.missing.path).toBe('new value'); // Other nested properties should remain
  });

  it('should bind nested paths with select elements - $bind', () => {
    class Test extends Component {
      state = {
        config: {
          display: {
            mode: 'list'
          }
        }
      };

      // prettier-ignore
      view = state => <>
        <select id='nestedSelect' $bind='config.display.mode'>
          <option value='list'>List</option>
          <option value='grid'>Grid</option>
          <option value='table'>Table</option>
        </select>
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const select = document.getElementById('nestedSelect') as HTMLSelectElement;

    // Check initial value
    expect(select.value).toBe('list');

    // Test updating nested select
    select.value = 'grid';
    select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    expect(component.state.config.display.mode).toBe('grid');
  });

  it('should bind nested paths with checkbox elements - $bind', () => {
    class Test extends Component {
      state = {
        settings: {
          notifications: {
            email: true,
            push: false
          }
        }
      };

      // prettier-ignore
      view = state => <>
        <input id='emailCheck' type='checkbox' $bind='settings.notifications.email' />
        <input id='pushCheck' type='checkbox' $bind='settings.notifications.push' />
      </>
    }

    const div = document.createElement('div');
    document.body.appendChild(div);
    const component = new Test().start(div) as any;

    const emailCheck = document.getElementById('emailCheck') as HTMLInputElement;
    const pushCheck = document.getElementById('pushCheck') as HTMLInputElement;

    // Check initial values
    expect(emailCheck.checked).toBe(true);
    expect(pushCheck.checked).toBe(false);

    // Test updating nested checkbox
    emailCheck.click();
    expect(component.state.settings.notifications.email).toBe(false);
    expect(component.state.settings.notifications.push).toBe(false); // Other properties should remain unchanged

    pushCheck.click();
    expect(component.state.settings.notifications.push).toBe(true);
    expect(component.state.settings.notifications.email).toBe(false); // Other properties should remain unchanged
  });
});
