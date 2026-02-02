# Liquid Glass Design System Guide

## Overview

This document provides a comprehensive guide to the liquid glass design system implemented in VibeSwipe, including animation timing, dark mode support, and testing guidelines.

## 🎨 Design Tokens

### Blur Intensities

```typescript
blur: {
  subtle: 10,   // Light touch of blur for overlay elements
  medium: 20,   // Standard blur for cards and sheets
  intense: 30,  // Deep blur for headers and modal overlays
}
```

### Spacing System (Breathing Room)

```typescript
spacing: {
  intimate: 12,  // Tight spacing for related elements
  cozy: 16,      // Comfortable spacing within cards
  comfort: 20,   // Generous spacing between sections
  breathe: 24,   // Maximum breathing room for top-level layout
}
```

### Corner Radii (Soft Edges)

```typescript
corners: {
  soft: 20,      // Gentle curves for inputs and small cards
  medium: 24,    // Standard curves for cards and sheets
  large: 28,     // Pronounced curves for hero elements
}
```

### Motion Specs

```typescript
motion: {
  spring: {
    damping: 20,      // Bounce feel (lower = more bounce)
    stiffness: 300,   // Speed of animation (higher = faster)
  }
}
```

## 🎭 Animation Timing Reference

### Button Press Animations

**Location**: GlassButton, GlassCard, CreatePostFAB, QuickJournalFAB

```typescript
// Press In
Animated.spring(scaleAnim, {
  toValue: 0.97, // 3% scale reduction
  useNativeDriver: true,
  damping: 20,
  stiffness: 300,
});

// Press Out
Animated.spring(scaleAnim, {
  toValue: 1, // Return to normal
  useNativeDriver: true,
  damping: 20,
  stiffness: 300,
});
```

**Feel**: Quick, responsive, with slight bounce
**Duration**: ~200-300ms total
**Best for**: Interactive elements that need immediate feedback

### Like Button Animation

**Location**: PostCard

```typescript
Animated.sequence([
  Animated.spring(likeScale, {
    toValue: 1.2, // 20% growth
    damping: 10, // More bounce
    stiffness: 400, // Faster
  }),
  Animated.spring(likeScale, {
    toValue: 1,
    damping: 15,
    stiffness: 300,
  }),
]);
```

**Feel**: Playful pop with emphasized bounce
**Duration**: ~400-500ms total
**Best for**: Delightful micro-interactions

### Rotation Animation

**Location**: QuickJournalFAB

```typescript
Animated.timing(rotateAnim, {
  toValue: 1, // 0deg → 90deg
  duration: 200, // Fixed duration
  useNativeDriver: true,
});
```

**Feel**: Smooth, predictable rotation
**Duration**: 200ms
**Best for**: Icon state changes

## 🌓 Dark Mode Implementation

### Theme Detection

All components use `useTheme()` hook to access current theme:

```typescript
const theme = useTheme();
const isDark = theme.dark;
```

### Color References

Always reference colors through theme, never hardcode:

```typescript
// ✅ Correct
color: theme.colors.onSurface;
backgroundColor: theme.colors.background;

// ❌ Incorrect
color: "#FFFFFF";
backgroundColor: "#000000";
```

### Theme-Aware Glass Surfaces

```typescript
<GlassView
  variant="card"
  intensity="medium"
  // Automatically adapts blur tint based on theme
/>

<BlurView
  intensity={liquidGlass[theme.dark ? 'dark' : 'light'].blur.medium}
  tint={theme.dark ? 'dark' : 'light'}
/>
```

### Platform-Specific Blur Behavior

- **iOS**: Uses native BlurView with proper tint (light/dark)
- **Android**: Falls back to translucent background

```typescript
// GlassView handles this automatically
Platform.select({
  ios: <BlurView tint={theme.dark ? 'dark' : 'light'} />,
  default: <View style={{ backgroundColor: glassFill }} />
})
```

## ✅ Testing Checklist

### Dark Mode Transitions

Test these scenarios in profile settings:

1. **Toggle Dark Mode Switch**
   - [ ] All text colors update instantly
   - [ ] Glass surfaces adapt tint (light/dark)
   - [ ] Icons use theme-appropriate colors
   - [ ] No white flashes or jarring transitions
   - [ ] Status bar updates to match theme (iOS)

2. **Cross-Screen Consistency**
   - [ ] Feed screen maintains theme
   - [ ] Connect screen emotion cards use theme colors
   - [ ] Chat bubbles use correct glass tint
   - [ ] Journal entries respect theme
   - [ ] Post creation screen adapts properly
   - [ ] Profile screen updates all sections

3. **System Theme Sync** (if enabled)
   - [ ] App respects system dark mode setting
   - [ ] Changes when system theme toggles
   - [ ] Persists preference across app restarts

### Animation Testing on Actual Devices

#### Slow Motion Testing (iOS)

Enable Developer Settings → Slow Animations

- [ ] Spring animations feel smooth, not sluggish
- [ ] No jank or dropped frames
- [ ] Animations complete fully before next interaction

#### Performance Testing

- [ ] 60fps maintained during animations
- [ ] No layout jumps or reflows
- [ ] Smooth scrolling with glass headers
- [ ] Multiple simultaneous animations work well

#### Interaction Feel

Test on physical devices (simulator ≠ real feel):

1. **Feed Scrolling**
   - [ ] Smooth deceleration
   - [ ] Floating header stays crisp
   - [ ] PostCards don't lag during scroll

2. **Button Presses**
   - [ ] Immediate visual feedback (<16ms)
   - [ ] Satisfying "bounce back"
   - [ ] No delay between tap and animation

3. **FAB Interactions**
   - [ ] CreatePostFAB scales smoothly
   - [ ] QuickJournalFAB rotation feels right
   - [ ] Multiple taps don't break animation state

4. **Keyboard Handling**
   - [ ] Smooth transitions when keyboard appears
   - [ ] No input hiding behind keyboard
   - [ ] Content scrolls to keep focus visible
   - [ ] Keyboard dismisses smoothly

### Recommended Adjustments by Device

#### High-End Devices (iPhone 14+, Pixel 7+)

Current settings are optimal:

```typescript
damping: 20, stiffness: 300
```

#### Mid-Range Devices

If animations feel too bouncy:

```typescript
damping: 25,     // Less bounce
stiffness: 280   // Slightly slower
```

#### Low-End/Older Devices

If animations lag:

```typescript
damping: 30,     // Minimal bounce
stiffness: 250   // Slower but smoother
duration: 150    // Shorter fixed durations
```

## 🎯 Animation Principles

### 1. Respect User Preferences

```typescript
// TODO: Implement reduce motion support
const reduceMotion = useReducedMotion();
const duration = reduceMotion ? 0 : 200;
```

### 2. Purposeful Motion

- **Feedback**: Buttons scale to confirm press
- **Context**: FABs rotate to indicate state change
- **Delight**: Like button pops with joy
- **Never**: Gratuitous spinning or bouncing

### 3. Natural Physics

- Spring animations feel organic
- Objects have weight (via damping)
- Movements have inertia (via stiffness)
- Nothing teleports or snaps

### 4. Performance First

- Use `useNativeDriver: true` always
- Animate transform and opacity only
- Avoid animating layout properties
- Batch animations with Animated.parallel()

## 🔧 Fine-Tuning Guide

### Making Animations Snappier

```typescript
stiffness: 350 → 400  // Faster response
damping: 20 → 18      // More bounce
```

### Making Animations Softer

```typescript
stiffness: 300 → 250  // Slower response
damping: 20 → 25      // Less bounce
```

### Extending Duration

```typescript
duration: 200 → 250   // Timing animations only
```

### Testing Custom Values

1. Edit `constants/theme.ts` motion tokens
2. Hot reload preserves state
3. Test on device, not simulator
4. Get feedback from multiple users
5. Compare to native iOS animations

## 📱 Platform Considerations

### iOS

- Native blur works beautifully
- Use UIVisualEffectView tints
- Match iOS spring animations
- Respect safe areas strictly

### Android

- Translucent fallback looks good
- Consider Material Design motion
- Test on various Android versions
- Check with different system animations

## 🎨 Glass Material Guidelines

### When to Use Each Variant

**card** (most common)

- Feed posts
- Profile sections
- Chat conversation cards
- Journal entry cards

**sheet** (modal contexts)

- Bottom sheets
- Modal overlays
- Floating panels

**overlay** (full screen)

- Headers
- Tab bars
- Navigation overlays

### When to Use Each Intensity

**subtle** (10)

- Secondary actions
- Background overlays
- Danger zones with light touch

**medium** (20)

- Standard cards
- Most interactive elements
- Primary content containers

**intense** (30)

- Floating headers
- Modal overlays
- Tab bar backgrounds
- Elements that need visual separation

## 📐 Spacing Philosophy

The spacing system creates "breathing room" for introverts:

```typescript
// Too tight - feels cramped
marginBottom: 8;

// Just right - feels comfortable
marginBottom: liquidGlass.spacing.cozy(16);

// Generous - feels spacious
marginBottom: liquidGlass.spacing.breathe(24);
```

**Rule of thumb**: If it feels too tight, add one step up in spacing scale.

## 🎨 Color Philosophy

### Light Mode

- Soft slate blue primary (#8B7EC8)
- Muted sea green secondary (#70B7AE)
- Calm neutral backgrounds
- High contrast text for accessibility

### Dark Mode

- Deeper hues with reduced saturation
- Glass surfaces with dark tint
- Softer whites (#E8E8E8) for text
- True blacks avoided (use dark grays)

### Mood Colors (Connect Screen)

```typescript
getMoodColor(averageMood: number) {
  if (averageMood >= 4) return theme.colors.secondary  // Happy/content
  if (averageMood >= 3) return theme.colors.primary    // Neutral/calm
  return theme.colors.tertiary                         // Low/struggling
}
```

## 🚀 Next Steps

### Future Improvements

1. Implement `useReducedMotion()` hook
2. Add haptic feedback on interactions
3. Create animation presets system
4. Build animation playground for testing
5. Add scroll-based animations
6. Implement page transitions

### Accessibility

1. Ensure animations respect reduced motion
2. Maintain WCAG AA contrast ratios
3. Test with VoiceOver/TalkBack
4. Verify touch target sizes (44x44pt min)
5. Support dynamic type scaling

---

**Last Updated**: February 2, 2026  
**Version**: 2.0 (Liquid Glass)  
**Maintained by**: VibeSwipe Design Team
