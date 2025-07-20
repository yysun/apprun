export async function createState(state, updater) {
    let produce;
    try {
        // dynamic ESM import
        const mod = await import('immer');
        produce = mod.produce;
    }
    catch (_a) {
        throw new Error("immer is not installed. Please run: npm install immer");
    }
    return produce(state, updater);
}
//# sourceMappingURL=createState.js.map