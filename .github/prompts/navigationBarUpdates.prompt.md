You are a senior mobile UI engineer.

Enhance the existing iOS Liquid Glass floating tab bar by adding a Floating Action Button (FAB) dedicated to journaling.

This is NOT a standard Material FAB.

It must follow Apple-style Liquid Glass design.

The FAB represents the PRIMARY action of the app (quick journal entry).

---

## DESIGN GOAL

The button must feel:

- soft
- calm
- premium
- floating
- emotionally inviting

NOT:

- loud
- bright
- heavy
- material design
- chunky

Think:
"glass bubble floating above the interface"

---

## VISUAL SPEC

Size:
56–60 circle

Material:

- backdrop blur
- blurAmount 22–28
- translucent white (rgba(255,255,255,0.45))
- soft border rgba(255,255,255,0.35)
- subtle inner highlight
- shadow opacity 0.15–0.20
- shadow radius 25–30

Accent:

- lavender tint rgba(142,140,235,0.12)
- icon color #8E8CEB

Icon:

- feather
- 22–24 size
- medium weight
- centered

---

## PLACEMENT

- floating
- centered horizontally
- slightly above tab bar
- detached from edges
- safe-area aware

Must look layered ABOVE the glass tab bar.

---

## BEHAVIOR

Tap:

- spring scale 0.94
- light haptic
- open journal composer bottom sheet

Do NOT navigate screens.

It must open an inline bottom sheet.

Keyboard:

- stays above keyboard
- never hidden

Optional:

- scroll-aware hide/show

---

## TECHNICAL

- reusable FloatingGlassFAB component
- uses blur view
- animated with reanimated
- works with safe-area
- integrates with existing tab bar

---

## DELIVERABLES

Return:

- FloatingGlassFAB component
- integration example
- styles
- tokens used
- explanation
