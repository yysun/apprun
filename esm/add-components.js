import app from './app'; // ADD: Global app instance access
// Type guard functions using the enhanced type system
function isComponentInstance(obj) {
    return obj && typeof obj === 'object' && typeof obj.mount === 'function';
}
function isComponentConstructor(fn) {
    return typeof fn === 'function' &&
        fn.prototype &&
        fn.prototype.constructor === fn &&
        (fn.prototype.mount !== undefined ||
            fn.prototype.state !== undefined ||
            fn.prototype.view !== undefined);
}
function isFactoryFunction(fn) {
    return typeof fn === 'function' && !isComponentConstructor(fn);
}
// Recursive function resolution with enhanced type checking
async function resolveComponent(component, maxDepth = 3) {
    let resolved = component;
    let depth = 0;
    while (isFactoryFunction(resolved) && depth < maxDepth) {
        try {
            const result = await resolved();
            if (result === resolved)
                break; // Prevent infinite loops
            resolved = result;
            depth++;
        }
        catch (error) {
            console.error(`Error executing component function: ${error}`);
            break;
        }
    }
    return resolved;
}
export default async (element, components) => {
    for (const [route, component] of Object.entries(components)) {
        if (!component || !route) {
            console.error(`Invalid component configuration: component=${component}, route=${route}`);
            continue;
        }
        // Check if it's a direct component instance
        if (isComponentInstance(component)) {
            const options = { route };
            component.mount(element, options);
            continue;
        }
        // Check if it's a component class constructor
        if (isComponentConstructor(component)) {
            const instance = new component();
            const options = { route };
            instance.mount(element, options);
            continue;
        }
        // At this point it must be a function - resolve it
        if (isFactoryFunction(component)) {
            // Resolve the function to see what it returns
            let resolved = await resolveComponent(component);
            // Check if resolved result is a component instance
            if (isComponentInstance(resolved)) {
                const options = { route };
                resolved.mount(element, options);
                continue;
            }
            // Check if resolved result is a component constructor
            if (isComponentConstructor(resolved)) {
                const instance = new resolved();
                const options = { route };
                instance.mount(element, options);
                continue;
            }
            // If resolved result is still a function or anything else, treat original as event handler with render wrapper
            app.on(route, (...args) => {
                const result = component(...args);
                if (typeof element === 'string') {
                    element = document.querySelector(element);
                    if (!element) {
                        console.error(`Element not found: ${element}`);
                        return;
                    }
                }
                return app.render(element, result);
            });
            continue;
        }
        // If we get here, it's an invalid component type
        console.error(`Invalid component: component must be a class, instance, or function that returns a class/instance`);
    }
};
//# sourceMappingURL=add-components.js.map