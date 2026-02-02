# Color System Usage Guide

## Overview

This app uses a **platform-specific, calm, premium color system** designed for introverts.

**Design Philosophy:**

- 80% Neutrals (structure + readability)
- 15% Tonal Surfaces (depth hierarchy)
- 5% Emotional/Accent (meaning only)

The app should feel: **"quiet + warm + safe"** not "fun + energetic"

---

## Platform Differences

### iOS — Liquid Glass

- Translucent, soft, airy, frosted
- Uses blur effects and glass materials
- Feels native to iOS design language

### Android — Material 3

- Tonal surfaces with elevation hierarchy
- No blur effects (uses surface variants)
- Feels native to Material Design

---

## Importing Colors

```typescript
import { colors } from "@/constants/theme";

// Platform-automatically selected:
colors.background;
colors.accent.primary; // iOS
colors.primary; // Android
colors.mood.happy;
```

---

## Color Usage by Screen

### 📱 Feed / Wall

```typescript
// Background
backgroundColor: colors.background;

// Post cards
backgroundColor: Platform.select({
  ios: colors.glass.medium,
  android: colors.surface[1],
});

// Mood chips
backgroundColor: colors.mood.happy; // or other mood

// NO colored card backgrounds - keep neutral
```

**Key Rules:**

- Cards stay neutral with glass/tonal surfaces
- Only use mood colors for small chips
- Never use bright accent colors for large areas

---

### 📝 Journal

```typescript
// Background
backgroundColor: colors.background;

// Calendar days with mood
backgroundColor: colors.mood.calm; // 30% opacity
borderColor: colors.mood.calm;

// Journal entries
backgroundColor: Platform.select({
  ios: colors.surface.elev1,
  android: colors.surface[1],
});
```

**Key Rules:**

- Calendar dates show mood with soft background colors
- Keep entry cards neutral
- Mood colors at 30% opacity for calendar backgrounds

---

### 💬 Chat

```typescript
// Background
backgroundColor: colors.background;

// My message bubble
backgroundColor: Platform.select({
  ios: colors.accent.tint,
  android: colors.primaryContainer,
});

// Other person's bubble
backgroundColor: Platform.select({
  ios: colors.surface.elev1,
  android: colors.surface[1],
});

// Chat list items
backgroundColor: Platform.select({
  ios: colors.surface.base,
  android: colors.surface[0],
});
```

**Key Rules:**

- My bubbles use subtle accent tint (not full accent color)
- Other bubbles stay neutral
- Avoid bright colors in chat interface

---

### 🔍 Discover / Connect

```typescript
// Background
backgroundColor: colors.background;

// Compatibility badge
backgroundColor: colors.mood.happy;
// Or use percentage to determine mood color

// "Why matched?" explanation
color: Platform.select({
  ios: colors.text.secondary,
  android: colors.text.secondary,
});

// Action buttons
backgroundColor: Platform.select({
  ios: colors.accent.primary,
  android: colors.primary,
});
```

**Key Rules:**

- Compatibility meter uses mood colors
- Keep most UI neutral
- Accent only on primary action buttons

---

### 👤 Profile

```typescript
// Background
backgroundColor: colors.background;

// Identity card
backgroundColor: Platform.select({
  ios: colors.glass.medium,
  android: colors.surface[1],
});

// "You are anonymous as [alias]" section
color: Platform.select({
  ios: colors.text.primary,
  android: colors.text.primary,
});

// Toggles/switches
activeColor: Platform.select({
  ios: colors.accent.primary,
  android: colors.primary,
});
```

**Key Rules:**

- Mostly grayscale/neutral
- Accent only for toggles and active states
- No bright colors in profile

---

## Mood Color Mapping

Use these colors ONLY for:

- Small chips
- Calendar backgrounds (30% opacity)
- Compatibility badges
- Tiny accents

```typescript
colors.mood.verySad; // "#E5ECF6" - Very pale blue
colors.mood.sad; // "#C9D8F2" - Soft blue
colors.mood.neutral; // "#E5E7EB" - Light gray
colors.mood.calm; // "#E6E0FF" - Pale lavender
colors.mood.happy; // "#D7F2E3" - Soft mint
colors.mood.excited; // "#FFE7C7" - Warm peach
```

**Never use mood colors for:**

- Large backgrounds
- Full card backgrounds
- Navigation elements
- Text (except in rare cases)

---

## iOS-Specific: Glass Materials

```typescript
import { colors, liquidGlass } from '@/constants/theme';

// Light glass (60% opacity)
backgroundColor: colors.glass.light

// Medium glass (45% opacity) - recommended for most cards
backgroundColor: colors.glass.medium

// Heavy glass (30% opacity)
backgroundColor: colors.glass.heavy

// Glass border
borderColor: colors.glass.border

// With blur effect
<BlurView
  intensity={liquidGlass.light.blur.medium}
  style={{ backgroundColor: colors.glass.medium }}
/>
```

---

## Android-Specific: Surface Elevation

```typescript
import { colors } from "@/constants/theme";

// Base surface (no elevation)
backgroundColor: colors.surface[0];

// Low elevation
backgroundColor: colors.surface[1];

// Medium elevation
backgroundColor: colors.surface[2];

// High elevation
backgroundColor: colors.surface[3];
```

---

## Text Colors

```typescript
// iOS
colors.text.primary; // "#1C1D21" - Main text
colors.text.secondary; // "#6B7280" - Supporting text
colors.text.tertiary; // "#9CA3AF" - Disabled/subtle text

// Android
colors.text.primary; // "#1B1C1F" - Main text
colors.text.secondary; // "#70757F" - Supporting text
colors.text.disabled; // "#A1A6B0" - Disabled text
```

---

## Accent/Primary Colors

**Use ONLY for:**

- FAB (Floating Action Button)
- Primary action buttons
- Active tab indicator
- Links
- Toggles (active state)

```typescript
// iOS
colors.accent.primary; // "#8E8CEB" - Main accent
colors.accent.soft; // "#C7C6FF" - Lighter variant
colors.accent.tint; // "rgba(142,140,235,0.10)" - 10% tint

// Android
colors.primary; // "#7F7CE6"
colors.primaryContainer; // "#E5E3FF"
```

**DON'T use accent colors for:**

- Large backgrounds
- Multiple buttons in same view
- Decorative elements
- Card backgrounds

---

## Examples

### ✅ Good Usage

```typescript
// Feed card - neutral with glass
<View style={{
  backgroundColor: Platform.select({
    ios: colors.glass.medium,
    android: colors.surface[1]
  }),
  borderRadius: liquidGlass.corners.large
}}>
  {/* Mood chip - small accent */}
  <View style={{
    backgroundColor: colors.mood.happy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  }}>
    <Text>Happy</Text>
  </View>
</View>

// Primary button - accent color
<Button
  mode="contained"
  buttonColor={Platform.select({
    ios: colors.accent.primary,
    android: colors.primary
  })}
>
  Post
</Button>
```

### ❌ Bad Usage

```typescript
// DON'T: Full card with mood color
<View style={{
  backgroundColor: colors.mood.happy, // Too much color!
  padding: 20
}}>
  <Text>This is too bright for a card</Text>
</View>

// DON'T: Multiple accent buttons
<View>
  <Button color={colors.accent.primary}>Action 1</Button>
  <Button color={colors.accent.primary}>Action 2</Button>
  <Button color={colors.accent.primary}>Action 3</Button>
</View>

// DON'T: Accent text everywhere
<Text style={{ color: colors.accent.primary }}>
  This should be neutral text
</Text>
```

---

## Testing Your Colors

### Visual Check:

1. **80% should be neutral** - mostly grays and whites
2. **15% should be tonal** - subtle surface variations
3. **5% should be colored** - small accents only

### Emotional Check:

- Does it feel **calm**?
- Does it feel **warm**?
- Does it feel **safe**?
- Is it **low stimulation**?

If anything feels "loud" or "energetic", reduce the color.

---

## Platform Detection Examples

```typescript
import { Platform } from 'react-native';
import { colors } from '@/constants/theme';

// Simple platform check
const cardBackground = Platform.select({
  ios: colors.glass.medium,
  android: colors.surface[1],
  default: colors.surface.base
});

// Function-based
const getPrimaryColor = () => {
  if (Platform.OS === 'ios') {
    return colors.accent.primary;
  }
  return colors.primary;
};

// Component-level
{Platform.OS === 'ios' ? (
  <BlurView
    intensity={liquidGlass.light.blur.medium}
    style={{ backgroundColor: colors.glass.medium }}
  >
    {children}
  </BlurView>
) : (
  <Surface
    elevation={1}
    style={{ backgroundColor: colors.surface[1] }}
  >
    {children}
  </Surface>
)}
```

---

## Quick Reference

```typescript
// Backgrounds
colors.background;

// Cards/Surfaces
Platform.OS === "ios" ? colors.glass.medium : colors.surface[1];

// Primary Action
Platform.OS === "ios" ? colors.accent.primary : colors.primary;

// Text
colors.text.primary;
colors.text.secondary;

// Mood (sparingly!)
colors.mood.happy;
colors.mood.calm;
```

---

Remember: **When in doubt, use neutral colors.** Color is for meaning, not decoration.
