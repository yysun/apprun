// Add Jest-specific test setup
global.spyOn = (obj, method) => {
  const spy = jest.spyOn(obj, method);
  spy.calls = {
    allArgs: () => spy.mock.calls,
    all: () => spy.mock.calls.map(args => ({ args })),
    count: () => spy.mock.calls.length,
    first: () => spy.mock.calls[0],
    mostRecent: () => spy.mock.calls[spy.mock.calls.length - 1]
  };
  return spy;
};

// Mock jasmine functionality with Jest equivalents
global.jasmine = {
  createSpy: (name) => {
    const spy = jest.fn();
    spy.calls = {
      allArgs: () => spy.mock.calls,
      all: () => spy.mock.calls.map(args => ({ args })),
      count: () => spy.mock.calls.length,
      first: () => spy.mock.calls[0],
      mostRecent: () => spy.mock.calls[spy.mock.calls.length - 1]
    };
    spy.and = {
      callThrough: () => spy,
      returnValue: (val) => spy.mockReturnValue(val),
      callFake: (fn) => spy.mockImplementation(fn)
    };
    return spy;
  }
};

// Setup document if it doesn't exist (for JSDOM)
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({
      setAttribute: () => {},
      style: {},
      appendChild: () => {}
    }),
    createComment: () => ({}),
    body: {
      appendChild: () => {}
    }
  };
}
