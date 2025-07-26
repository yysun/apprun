# Why `unknown` is Better Than `any` in TypeScript

## Introduction

TypeScript offers two top types for variables of any type: `any` and `unknown`. While both allow you to assign any value, `unknown` is a safer and more robust alternative to `any`. This post explores why `unknown` is better, its benefits, and how it maintains backward compatibility.

## The Problem with `any`

The `any` type disables type checking for a variable. Once a value is typed as `any`, you can perform any operation on it without compile-time errors. This flexibility comes at the cost of losing all type safety, making it easy to introduce bugs and making refactoring harder.

```typescript
let value: any = "hello world";
value.foo(); // No error at compile time, but will fail at runtime
```

## The Power of `unknown`

The `unknown` type is similar to `any` in that it can hold any value. However, it is much safer because you must perform type checking before using the value. TypeScript enforces this at compile time.

```typescript
let value: unknown = "hello world";
// value.foo(); // Error: Object is of type 'unknown'.

if (typeof value === "string") {
  console.log(value.toUpperCase()); // Safe
}
```

## Benefits of Using `unknown`

1. **Type Safety**: Forces you to check the type before using the value, preventing many runtime errors.
2. **Better Refactoring**: TypeScript will alert you to places where you need to handle unknown types, making code changes safer.
3. **Documentation**: Signals to other developers that the value could be anything and must be handled with care.
4. **Gradual Adoption**: You can incrementally replace `any` with `unknown` to improve code safety without breaking existing code.

## Backward Compatibility

Switching from `any` to `unknown` is usually backward compatible. The main difference is that TypeScript will now require explicit type checks before using the value. This may cause new compile-time errors, but these are beneficial—they highlight places where your code was previously unsafe.

If you need to maintain compatibility with older code, you can use type assertions or type guards to safely narrow `unknown` to a specific type:

```typescript
let value: unknown = getValue();
let str: string = value as string; // Type assertion
```



## Changing Default Generics: `Component<T=any, E=any>` to `Component<T=unknown, E=unknown>`

AppRun used to have the Component classes with generic parameters defaulting to `any`, such as:

```typescript
class Component<T = any, E = any> {}
```

In V3.380.0, AppRun switched these defaults to `unknown`:

```typescript
class Component<T = unknown, E = unknown> {}
```

### Benefits

- **Stronger Type Safety for Consumers**: Users of your API are now required to explicitly handle the type of state and events, reducing accidental misuse and runtime errors.
- **Better Type Inference**: TypeScript will prompt users to specify or narrow types, leading to more robust and self-documenting code.
- **Encourages Best Practices**: Promotes explicit typing and safer code patterns throughout the ecosystem.

### Compatibility

- **Mostly Backward Compatible**: Existing code that explicitly sets `T` and `E` will continue to work as before.
- **Compile-Time Errors for Unsafe Usage**: Code that relied on the permissiveness of `any` may now produce compile-time errors, but these highlight places where type safety was previously lacking.
- **Easy Migration**: Developers can update their code by providing explicit types or using type assertions where necessary.

**Summary:**

Changing default generics from `any` to `unknown` is a low-risk, high-reward improvement for library maintainers. It nudges users toward safer, more maintainable code without breaking most existing usage, and any new errors are opportunities to improve type safety.

## Conclusion

Using `unknown` instead of `any` is a best practice in modern TypeScript. It provides stronger type safety, better documentation, and helps prevent bugs. While it may require a few more type checks, the benefits far outweigh the costs, especially in large or critical codebases.


*Want to learn more? Check out the [TypeScript Handbook on `unknown`](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown) for further reading.*

