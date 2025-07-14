# VDOM Skip Logic Implementation

## Overview

The VDOM Skip Logic is a feature that prevents user interaction disruption during VDOM reconciliation by intelligently skipping certain property updates that would interfere with active user interactions.

## Implementation Details

### Skip Logic Function

```typescript
function shouldSkipPatch(dom: HTMLElement, prop: string): boolean {
  // 1️⃣  If the element is focused, guard the "cursor-sensitive" props
  if (document.activeElement === dom) {
    return ['value', 'selectionStart', 'selectionEnd', 'selectionDirection']
           .includes(prop);
  }
  // 2️⃣  Always preserve live scroll state
  if (prop === 'scrollTop' || prop === 'scrollLeft') {
    return true;
  }
  // 3️⃣  Let the media element keep playing unless VDOM actually changed it
  if (dom instanceof HTMLMediaElement &&
      ['currentTime', 'paused', 'playbackRate', 'volume'].includes(prop)) {
    return true;
  }
  return false;           // default: allow normal diff logic
}
```

### Protected Properties

#### Focus-Sensitive Properties
When an element has focus (`document.activeElement === dom`):
- `value` - Text content of input/textarea elements
- `selectionStart` - Start position of text selection
- `selectionEnd` - End position of text selection  
- `selectionDirection` - Direction of text selection

#### Scroll Properties (Always Protected)
- `scrollTop` - Vertical scroll position
- `scrollLeft` - Horizontal scroll position

#### Media Element Properties (Always Protected)
For `HTMLMediaElement` instances:
- `currentTime` - Current playback position
- `paused` - Play/pause state
- `playbackRate` - Playback speed
- `volume` - Audio volume level

## Benefits

### User Experience Improvements

1. **Typing Continuity**: Users can type without interruption even during frequent VDOM updates
2. **Selection Preservation**: Text selection remains intact during re-renders
3. **Scroll Position Stability**: Scroll positions don't jump during updates
4. **Media Playback Smoothness**: Videos and audio continue playing without glitches

### Technical Advantages

1. **Proactive Prevention**: Prevents problems before they occur rather than fixing them afterward
2. **Performance**: Avoids unnecessary DOM manipulations
3. **Predictable Behavior**: Consistent user experience across different interaction scenarios

## Usage

The skip logic is automatically integrated into the `updateProps` function and requires no additional configuration:

```typescript
import { updateProps } from '../src/vdom-my-prop-attr';

const element = document.createElement('input');
element.focus(); // Element is now focused

// This update will skip the 'value' property but apply 'className'
updateProps(element, { 
  value: 'new value',      // ← SKIPPED (element is focused)
  className: 'updated'     // ← APPLIED (not focus-sensitive)
}, false);
```

## Testing

Comprehensive tests cover:
- Focus-sensitive property skipping
- Scroll property preservation
- Media element property protection
- Multiple skip conditions
- Property merging with skip logic
- Edge cases and performance

Test file: `tests/vdom-my-skip-logic.spec.tsx`

## Migration Notes

### Changes from Previous Implementation

**Before (Protection Logic)**:
- Captured protected properties before updates
- Applied all changes
- Restored protected values afterward

**After (Skip Logic)**:
- Checks if property should be skipped before applying
- Never applies problematic updates
- Cleaner and more performant

### Backward Compatibility

The skip logic is fully backward compatible with existing code. No changes are required to existing applications.

## Future Enhancements

Potential improvements:
1. Configurable skip conditions
2. Element-specific skip rules
3. Debug mode for tracking skipped updates
4. Integration with developer tools

## Related Files

- `src/vdom-my-prop-attr.ts` - Main implementation
- `tests/vdom-my-skip-logic.spec.tsx` - Comprehensive tests
- `docs/done/skip-logic.md` - This documentation

---

*Updated: 2025-01-14*  
*Feature: Skip Logic for User Interaction Preservation*
