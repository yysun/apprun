var CHANGES;
(function (CHANGES) {
    CHANGES[CHANGES["NO_ATTR_CHANGE"] = 1] = "NO_ATTR_CHANGE";
    CHANGES[CHANGES["NO_TREE_CHANGE"] = 2] = "NO_TREE_CHANGE";
})(CHANGES || (CHANGES = {}));
function patch(vdom1, vdom2) {
    const old_len = vdom1.length;
    const new_len = vdom2.length;
    const len = Math.min(old_len, new_len);
    for (let i = 0; i < len; i++) {
        const node1 = vdom1[i];
        const node2 = vdom2[i];
        if (typeof node2 !== 'object')
            continue;
        if (_areEquals(node1, node2)) {
            node2._op = CHANGES.NO_ATTR_CHANGE | CHANGES.NO_TREE_CHANGE;
        }
        else {
            if (_areEquals(node1.props, node2.props)) {
                node2._op = CHANGES.NO_ATTR_CHANGE;
            }
            if (_areEquals(node1.children, node2.children)) {
                node2._op = node2._op | CHANGES.NO_TREE_CHANGE;
            }
            else {
                patch(node1.children, node2.children);
            }
        }
    }
}
// based on https://github.com/epoberezkin/fast-deep-equal
// MIT License
// Copyright (c) 2017 Evgeny Poberezkin
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
export function _areEquals(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length)
                return false;
            for (i = length; i-- !== 0;)
                if (!_areEquals(a[i], b[i]))
                    return false;
            return true;
        }
        if (arrA != arrB)
            return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length)
            return false;
        for (i = length; i-- !== 0;)
            if (!b.hasOwnProperty(keys[i]))
                return false;
        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!_areEquals(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
;
export default patch;
//# sourceMappingURL=vdom-patch.js.map