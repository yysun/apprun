import { produce } from 'immer';
export function createState(fn) {
    return (state, ...args) => {
        return produce(state, (draft) => {
            fn(draft, ...args);
        });
    };
}
//# sourceMappingURL=createState.js.map