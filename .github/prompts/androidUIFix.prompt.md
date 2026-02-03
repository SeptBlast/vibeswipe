You are a senior React Native mobile engineer.

Your task is to refactor ONLY the Android UI layer of this app to follow Material 3 design.

CRITICAL:
Do NOT modify or regress iOS behavior or visuals.
iOS already uses a Liquid Glass design system and must remain untouched.

We must introduce platform-native rendering:

- iOS → Liquid Glass (blur, floating, glass)
- Android → Material 3 (tonal surfaces, elevation, solid backgrounds)

---

## CURRENT PROBLEM

Android is currently rendering:

- blur views
- glass surfaces
- floating capsule tab bars
- iOS headers
- soft shadows
- translucent materials

This makes the Android UI look fake and non-native.

We must REMOVE all glass metaphors from Android.

---

## GOAL

Make Android look 100% native Material 3.

After refactor:
Android should feel like a modern Pixel app, not an iOS clone.

---

## HARD RULES (MANDATORY)

Android must NEVER use:

- BlurView
- translucency
- floating glass capsules
- iOS style headers
- heavy drop shadows
- frosted backgrounds

Android must ALWAYS use:

- tonal surfaces
- elevation
- ripple feedback
- TopAppBar
- BottomNavigationBar
- Material FAB
- solid backgrounds

---

## ARCHITECTURE REQUIRED

Create platform-specific components.

Structure:

components/surface/
GlassSurface.tsx (iOS only)
MaterialSurface.tsx (Android only)
index.ts (Platform.select)

components/navigation/
GlassTabBar.tsx (iOS only)
MaterialTabBar.tsx (Android only)

components/fab/
GlassFAB.tsx (iOS)
MaterialFAB.tsx (Android)

All screens must consume these abstractions, not platform-specific logic inline.

---

## THEME TOKENS (Android)

Use exactly these tokens:

background #FAFAFB
surface0 #FFFFFF
surface1 #F5F6F8
surface2 #EEF0F4
surface3 #E7E9EE
outline #E0E2E8

primary #7F7CE6
container #E5E3FF

textPrimary #1B1C1F
textSecondary #70757F

---

## COMPONENT REPLACEMENTS

Tab bar:
Replace glass floating capsule
→ Material BottomNavigationBar with elevation 3

FAB:
Replace glass button
→ Material circular FAB (solid primary color + ripple)

Headers:
Replace floating text headers
→ TopAppBar with solid background

Cards:
Replace blur/shadow cards
→ surface1 + elevation 1–2 only

Chat bubbles:
mine → primaryContainer
theirs → surface2
NO blur

---

## TECHNICAL REQUIREMENTS

- Use Platform.select
- Zero code duplication
- Reusable components
- No regressions on iOS
- Clean separation of design systems
- 60fps performance
- No unnecessary re-renders

---

## DELIVERABLES

Return:

1. New folder structure
2. All new components
3. Refactored surfaces
4. Updated navigation
5. Updated theme.ts
6. Example usage
7. Short explanation of changes

Only output production-ready code.
Do not explain theory.
