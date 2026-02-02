You are a senior iOS + React Native UI engineer.

Your task is to design and implement a production-ready floating bottom navigation bar that follows modern Apple Liquid Glass design (2025–2026 system material style) for iOS only.

This is NOT a standard tab bar.

It must visually and behaviorally match:

- iOS Control Center
- iOS system sheets
- VisionOS floating capsules

The result must feel:

- soft
- calm
- translucent
- floating
- premium
- edge-to-edge immersive

NOT:

- flat
- boxed
- material design
- rigid header/footer
- heavy borders
- bright colors

---

## PRODUCT CONTEXT

This is an introvert-focused journaling + social app.

Tabs:

1. Home (Wall)
2. Journal
3. Connect
4. Chat
5. Profile

Tone:
calm • low stimulation • minimal • emotionally safe

---

## DESIGN SPEC (MANDATORY)

### Layout

- floating above content
- NOT attached to bottom edge
- detached capsule shape
- safe-area aware

### Container

height: 64–72
radius: 32–34
marginHorizontal: 16–20
bottom offset: safeArea + 12

### Glass material

Use real blur (not opacity)
blurAmount: 22–28
background: rgba(255,255,255,0.45)
border: rgba(255,255,255,0.35)
inner top highlight: rgba(255,255,255,0.7)
shadow:
opacity 0.12–0.16
radius 20–28
offsetY 10–12

### Depth

Must look like floating glass
Never flat
Never solid white

### Tabs

5 equal segments

Inactive:

- icon gray (#8B90A0)
- label gray
- low visual weight

Active:

- soft lavender tint background (rgba(142,140,235,0.12))
- icon lavender (#8E8CEB)
- subtle emphasis only
- NOT loud

### Typography

label size: 11–12
medium weight
tight spacing

### Motion

Press:

- scale 0.96 spring
- 150–200ms

Switch tab:

- fade + small slide
- smooth

No abrupt transitions

### Interaction

- haptic feedback on press
- supports safe area
- keyboard aware (hide or move above keyboard)
- scroll-aware hide/show optional
- hit targets ≥ 44dp

---

## PLATFORM RULES

iOS:
Use Liquid Glass blur

Android:
DO NOT use glass
Use Material 3 tonal surfaces instead

Architecture must allow platform-specific rendering.

---

## TECHNICAL REQUIREMENTS

Create:

1. A reusable component:
   LiquidGlassTabBar

2. Must integrate with React Navigation bottom tabs.

3. Must:
   - respect safe area
   - support dynamic icons
   - support labels
   - support active state
   - support animations
   - be performant (60fps)

4. Avoid:
   - nested blurs
   - heavy shadows
   - re-renders

5. Use:
   - @react-native-community/blur
   - react-native-reanimated
   - safe-area-context

---

## DELIVERABLES

Claude must output:

1. Full component implementation
2. Styles separated cleanly
3. Integration example with navigation
4. Theming tokens used
5. Comments explaining decisions
6. Performance notes
7. Accessibility notes
8. How to customize icons

---

## QUALITY BAR

If the bar looks:

- flat
- white
- boxed
- or attached to bottom

It is WRONG.

It must look like:
“a floating frosted capsule of glass hovering above the content”.

Think:
Apple system UI quality.

---

## RETURN FORMAT

Return:

- component file
- usage example
- theme tokens
- short explanation of design choices

Focus on clean, production-quality code only.
