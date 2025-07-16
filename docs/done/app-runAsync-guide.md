# Getting Event Handler Return Values with app.runAsync()

## Overview

When you need to get the return values from event handlers in AppRun, use `app.runAsync()` instead of `app.run()`. This method already provides exactly what you need without any breaking changes.

## Why app.runAsync()?

- ✅ **No breaking changes** - existing code continues to work
- ✅ **Already implemented** and fully tested
- ✅ **Handles all event types** - delayed, once, wildcard events
- ✅ **Consistent behavior** - always returns `Promise<any[]>`
- ✅ **Proper error handling** built-in

## Usage Patterns

### Single Event Handler

When you have one event handler and want its return value:

```typescript
// Define handler
app.on('calculate', (a, b) => a + b);

// Get return value
app.runAsync('calculate', 5, 10).then(results => {
  const sum = results[0]; // 15
});

// Or with destructuring
app.runAsync('calculate', 5, 10).then(([result]) => {
  console.log(result); // 15
});
```

### Multiple Event Handlers

When you have multiple handlers and want all their return values:

```typescript
// Define multiple handlers
app.on('validate', data => validateRequired(data));
app.on('validate', data => validateFormat(data));
app.on('validate', data => validateLength(data));

// Get all return values
app.runAsync('validate', userData).then(results => {
  console.log(results); // [requiredResult, formatResult, lengthResult]
  
  // Process each result
  results.forEach((result, index) => {
    console.log(`Validation ${index}:`, result);
  });
});
```

### Error Handling

When event handlers might fail:

```typescript
app.on('risky-operation', data => {
  if (data.invalid) throw new Error('Invalid data');
  return data.processed;
});

app.runAsync('risky-operation', data)
  .then(results => {
    // Failed handlers return null in the results array
    const successResults = results.filter(r => r !== null);
    console.log('Successful results:', successResults);
  })
  .catch(error => {
    // Handle promise rejection
    console.error('Operation failed:', error);
  });
```

### Async Event Handlers

Works seamlessly with async handlers:

```typescript
app.on('fetch-data', async (url) => {
  const response = await fetch(url);
  return response.json();
});

app.runAsync('fetch-data', '/api/users').then(results => {
  const userData = results[0];
  console.log('Fetched users:', userData);
});
```

### Component Usage

Use `runAsync()` in components the same way:

```typescript
class MyComponent extends Component {
  handleClick = () => {
    // Get return values from component event handlers
    this.runAsync('process-data', this.state.data).then(results => {
      console.log('Processing results:', results);
    });
  }
  
  update = {
    'process-data': (state, data) => {
      // Process data and return result
      return { ...state, processed: data.map(item => item * 2) };
    }
  }
}
```

## Migration from app.query()

**The `app.query()` method is deprecated. Replace it with `app.runAsync()`:**

```typescript
// Old (deprecated)
app.query('event', data).then(results => {
  // Handle results
});

// New (recommended)
app.runAsync('event', data).then(results => {
  // Handle results
});
```

## Best Practices

### 1. Use Destructuring for Single Results
```typescript
// Good
app.runAsync('single-handler', data).then(([result]) => {
  console.log(result);
});

// Also good
app.runAsync('single-handler', data).then(results => {
  console.log(results[0]);
});
```

### 2. Filter Failed Results
```typescript
app.runAsync('event', data).then(results => {
  const validResults = results.filter(r => r !== null && r !== undefined);
  // Work with valid results only
});
```

### 3. Handle Empty Results
```typescript
app.runAsync('maybe-no-handlers', data).then(results => {
  if (results.length === 0) {
    console.log('No handlers responded');
    return;
  }
  // Process results
});
```

### 4. Combine with Other Promises
```typescript
Promise.all([
  app.runAsync('validate', data),
  app.runAsync('transform', data),
  fetchFromAPI(data)
]).then(([validationResults, transformResults, apiResult]) => {
  // Handle all results together
});
```

## When to Use app.run() vs app.runAsync()

### Use `app.run()` when:
- You don't need return values (fire-and-forget)
- You want synchronous execution
- You're triggering UI updates or side effects

```typescript
// Fire-and-forget events
app.run('log-action', action);
app.run('update-ui', newState);
```

### Use `app.runAsync()` when:
- You need return values from event handlers
- You want to process results from multiple handlers
- You need to handle async operations
- You want consistent error handling

```typescript
// When you need results
app.runAsync('calculate', data).then(results => {
  console.log('Calculation results:', results);
});
```

## Advanced Examples

### Validation Pipeline
```typescript
// Set up validation chain
app.on('validate-user', user => validateRequired(user));
app.on('validate-user', user => validateEmail(user));
app.on('validate-user', user => validateAge(user));

// Run validation and collect results
app.runAsync('validate-user', userData).then(results => {
  const errors = results.filter(r => r && r.error);
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
  } else {
    console.log('User is valid');
  }
});
```

### Data Processing Pipeline
```typescript
// Processing steps
app.on('process', data => cleanData(data));
app.on('process', data => transformData(data));
app.on('process', data => validateData(data));

// Execute pipeline
app.runAsync('process', rawData).then(results => {
  const [cleaned, transformed, validated] = results;
  console.log('Processing complete:', { cleaned, transformed, validated });
});
```

### Plugin System
```typescript
// Plugins register handlers
app.on('plugin-hook', data => plugin1.process(data));
app.on('plugin-hook', data => plugin2.process(data));
app.on('plugin-hook', data => plugin3.process(data));

// Execute all plugins and collect results
app.runAsync('plugin-hook', inputData).then(results => {
  const pluginResults = results.filter(r => r !== null);
  console.log('Plugin results:', pluginResults);
});
```

## Summary

`app.runAsync()` is the perfect solution for getting event handler return values in AppRun. It's:

- **Available now** - no waiting for new releases
- **Non-breaking** - existing code continues to work
- **Feature-complete** - handles all event types and scenarios
- **Well-tested** - used in production applications
- **Future-proof** - follows modern async patterns

Replace any usage of the deprecated `app.query()` with `app.runAsync()` and enjoy getting return values from your event handlers!
