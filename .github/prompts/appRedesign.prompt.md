# Complete prompt to send to Claude Sonnet / Gemini (copy-paste ready)

Use this prompt to instruct an LLM (Claude Sonnet / Gemini) to create a complete design + engineering deliverable set for the **Introvert-First Social App**. It is deliberately prescriptive — include everything below in your request to the model so the output is immediately actionable for designers and engineers.

---

## Context / Product summary

We are building a mobile-first social app for **introverts** whose primary focus is **personal journaling + emotional safety** with optional social features. Key principles: **calm, private, low-stimulation, fluid, and keyboard-safe**. The app must be **platform-authentic**:

- **iOS**: Liquid Glass (backdrop blur, translucent surfaces, floating layers)
- **Android**: Material You / Material 3 (tonal surfaces, elevation, dynamic color)

Functionally identical features and flows must be shared across platforms; only visual language and native components differ.

Core user flows (5 major things):

1. Journal with mood tracking, calendar view with streaks; quick-journal accessible from anywhere.
2. Wall: share text, photos, short videos; friends can react & comment (low-pressure interactions).
3. Discover: suggest new people filtered by emotional state (last journal mood + 7-day average mood).
4. Chat: 1:1 and small groups (text, media, voice notes). Keyboard-safe composer that never hides inputs.
5. Anonymous identity system: default generated alias + avatar; user may toggle reveal to others.

---

## Deliverables (what I expect back from the LLM — be explicit)

1. **Figma file structure** + component library (detailed token sets and component specs) for both iOS and Android pages:
   - Foundations (tokens)
   - iOS page: components using Liquid Glass
   - Android page: Material 3 components
   - Shared components page (logical components)
   - Wireframes & prototypes for all flows (Journal, Wall, Discover, Chat, Profile)
   - Motion specs (timing, easing, spring params)
   - Accessibility notes (contrast, touch targets, font sizes)

2. **React Native starter repo scaffold** (TypeScript) with:
   - Clean folder structure (app, components/{ios,android,shared}, features/\*)
   - Theme/token system with platform adapter
   - `Surface` wrapper that chooses GlassView (iOS) or MaterialCard (Android)
   - Keyboard-aware container and universal QuickJournal entry component
   - Example screens: JournalScreen (full), ChatThread (full) — keyboard safe and functional
   - Sample Storybook entries for components
   - README with run/build instructions and dependency list

3. **Design + engineering spec document** (Markdown) that includes:
   - Component API (props, states, accessibility)
   - Interactions & micro-interactions per component
   - Performance constraints & best practices
   - Acceptance criteria for QA

4. **Data model & sample API contracts** for:
   - User + alias model
   - Journal entry + mood schema
   - Post (wall) schema
   - Match/Discover criteria and endpoints
   - Chat messages

5. **QA checklist & unit/e2e test plan** focusing on:
   - Keyboard safety
   - Anonymity toggle behavior
   - Mood-based discovery correctness
   - Performance (blur/animations)
   - Accessibility

6. **One-page handoff checklist** for handing the design to engineering.

---

## Design system & token requirements (copy these tokens exactly into the Figma foundations)

- Colors:
  - `primary` — neutral calm accent
  - `background` — iOS: edge-to-edge image or subtle texture; Android: system background (tonal)
  - `surface-1..4` — for layering (iOS uses blur-based surfaces, Android uses tonal levels)
  - `mood-very-sad`, `mood-sad`, `mood-neutral`, `mood-happy`, `mood-ecstatic` — pastel palette (5 colors)

- Radius: `sm:12`, `md:16`, `lg:24`, `xl:28`
- Spacing: `xs:4`, `sm:8`, `md:16`, `lg:24`, `xl:32`
- Typography: `title(20/22)`, `body(16)`, `caption(12)`; responsive scaling
- Elevation:
  - Android: `e0..e5` with shadow specs
  - iOS: use blur depth tokens: `blur-1(15)`, `blur-2(20)`, `blur-3(25)`

- Motion tokens:
  - `spring-soft`: `{mass:1, stiffness:120, damping:14}`
  - `spring-tight`: `{mass:1, stiffness:220, damping:20}`
  - `fade-short`: `200ms ease-out`
  - `slide-long`: `320ms cubic-bezier(.22,.9,.3,1)`

---

## Component list & detailed behavior (must be generated for both platforms — provide platform variants)

For each component below, provide:

- Figma component (all states)
- React Native component skeleton (TSX)
- Props interface
- Accessibility attributes
- Motion spec for show/hide/press

### Core components

1. `GlassView` (iOS) / `MaterialCard` (Android) — Surface wrapper
   - Props: `children`, `style`, `blurAmount?`, `tonalLevel?`, `accessibleLabel?`

2. `MoodPicker` — 5-state (emoji + label) + optional slider
   - Persist selection; communicates with Journal composer
   - Provide `compact` and `expanded` variants

3. `JournalComposer` (global)
   - Bottom sheet on iOS (glass) / modal or sheet on Android (M3)
   - Keyboard-aware: composer always above keyboard, with min padding 16–24px
   - Auto-save draft every 5s when typing
   - Supports text, light photo attach, optional voice note

4. `CalendarHeatmap` / `StreakIndicator`
   - Month view with mood color dots; show streak badge

5. `PostCard`
   - Accepts text / image / short video preview
   - Reactions (no count-first UI; show small chips)

6. `DiscoverCard`
   - alias, abstract avatar (not face photo), last mood, 7-day average mood, compatibility score
   - Actions: Connect (send request), Message (if connected)

7. `ChatComposer` + `MessageBubble`
   - Composer anchored above keyboard; supports attachments + voice notes
   - Message types: text, image, video, voice

8. `AnonymousProfileCard`
   - Toggle to reveal real identity (opt-in); clear copy to explain consequences

---

## UX rules & hard constraints (these are non-negotiable)

- **No persistent title bars**: pages must not use fixed title bars; use content-level section headings instead. Use floating nav chrome (tab bar) or top translucent overlay as needed.
- **Keyboard safety**: focused input must ALWAYS be visible. Implement `KeyboardAvoidingView` + insets + measure-to-visible focus logic; composer min padding 16–24px above keyboard.
- **Quick Journal**: a persistent quick-journal affordance accessible from any screen (floating FAB or edge gesture). It opens a top-level composer sheet.
- **Anonymity**: default generated alias and avatar; revealing real name must be explicit and reversible; log consent action.
- **Low-engagement social metrics**: do not display follower counts, or likes as leaderboard metrics. Show reaction chips and comments; avoid push notifications that draw unnecessary attention (configurable).
- **Performance**:
  - Keep `blurAmount ≤ 30` where used.
  - Avoid multiple nested BlurViews.
  - Use memoization and virtualization for lists (FlatList with windowing).
  - Maintain 60fps for scroll and composer interactions.

- **Accessibility**:
  - Contrast ratios ≥ 4.5:1 for body text.
  - Touch targets ≥ 44×44 dp.
  - Full VoiceOver/ TalkBack labeling for all actionable elements.

- **Privacy & Data**:
  - Journals default visibility: private (not posted to Wall).
  - Wall posts are explicit share actions.
  - Anonymized default behavior means backend stores user id but shows alias publicly.
  - Provide clear UI + copy for privacy settings.

---

## Data model (minimal canonical schemas — return as TypeScript interfaces)

Include these interfaces in the output:

```ts
interface User {
  id: string;
  alias: string; // e.g., "QuietRiver"
  avatarType: "abstract" | "upload";
  isAnonymous: boolean; // whether alias is active
  revealedName?: string; // optional when user toggles reveal
  createdAt: string;
  lastActiveAt: string;
}

interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: "very-sad" | "sad" | "neutral" | "happy" | "ecstatic";
  moodScore: number; // 0..100 normalized
  attachments?: string[]; // urls
  createdAt: string;
  updatedAt?: string;
}

interface Post {
  id: string;
  authorId: string;
  content?: string;
  media?: { type: "image" | "video"; url: string }[];
  createdAt: string;
  visibility: "public" | "friends" | "private";
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body?: string;
  media?: { type: "image" | "video" | "voice"; url: string };
  createdAt: string;
  editedAt?: string;
}
```

Also include a **sample API contract** (HTTP + example body) for:

- `POST /journal` (create)
- `GET /discover?mood=happy&avgMood=60` (list matches)
- `POST /match/request` (connect)
- `POST /messages/send` (chat)

---

## Emotion-matching algorithm spec (design + pseudo code)

Provide a brief algorithm to use for Discover suggestions:

1. For each candidate user:
   - `lastMoodScore = getLastJournalMoodScore(candidate)`
   - `avg7DayMood = average(last7Days.moodScore)`

2. Compute similarity score to current user:
   - `compatibility = 1 - abs(current.lastMoodScore - candidate.lastMoodScore)/100`
   - Boost if `abs(current.avg7Day - candidate.avg7Day) <= 15`
   - Factor in shared interests (optional)

3. Rank candidates by `compatibility * recencyFactor * activityFactor`
4. Return top N with privacy-safe alias only

Include pseudo-code and sample SQL/Mongo query examples.

---

## Accessibility & localisation

- Provide ARIA / accessibility labels for key components.
- Prepare for i18n: ensure strings are keys; layout supports long text.
- Provide one example of localized copy for the anonymity toggle and privacy explanation.

---

## Prototyping & motion

For all screens, provide:

- entry animation for composer (iOS: blur + slide-up with spring-soft)
- press states (scale 0.96 with spring-soft)
- list infinite-scroll placeholder shimmer (no loud animations)

Include exact motion parameters and example Lottie/JSON references (optional).

---

## Engineering notes & dependencies (practical)

Recommend these libraries and why:

- `@react-native-community/blur` — iOS blur surfaces
- `react-native-reanimated` — performant animations
- `react-native-gesture-handler` — gestures and sheets
- `react-native-paper` (Material 3) — Android components
- `@react-navigation/*` — navigation
- `zustand` or `@reduxjs/toolkit` — local state
- `react-native-keyboard-aware-scroll-view` or custom KeyboardAvoidingView with measure logic
- `react-native-fast-image` — performant images
- `ffmpeg-kit` or backend transcoding for short videos (server side)

---

## Output format instructions (how the LLM should return the result)

Ask the LLM to return a multi-part response with files and code snippets. Example:

1. A **Figma blueprint** summary with page list and component list (JSON or markdown).
2. A **zip-able repo scaffold** listing files with sample contents (provide key TSX files inline).
3. **Design tokens** as JSON.
4. **TypeScript interfaces** and **API contract** examples (in a single `api-spec.md`).
5. **Motion spec** table (component → animation → params).
6. **QA checklist** in markdown.
7. **One-page handoff** with acceptance criteria.

**Ask the LLM to produce each of these as separate markdown sections and include code blocks where relevant.**

---

## Acceptance criteria (what passes code/design review)

- Figma file contains Foundations + iOS + Android + Shared components + 7 prototype flows.
- React Native scaffold boots with `npm start` and shows Journal and Chat screens.
- Surface wrapper chooses platform-specific surfaces.
- Keyboard composer never hidden in provided Chat example (demonstrable code).
- Mood-based Discover endpoint pseudo-code included and returns sensible ranked list.
- Anonymity toggle UI + backend contract included.
- Performance notes and accessibility checks included.

---

## Example prompt prefix you can paste to model agents

> You are an expert product designer + React Native engineer. Produce a Figma file structure, tokens, component specs, and a TypeScript React Native starter scaffold for a mobile social app for introverts. Follow these platform rules: iOS uses Liquid Glass (backdrop blur), Android uses Material You (Material 3). Include keyboard-safe composers, global Quick Journal, mood tracking (calendar + streak), wall posts, chat, anonymous alias system, and emotion-based discovery. Provide Figma tokens JSON, TypeScript interfaces, sample API endpoints, and two fully coded screens: JournalScreen.tsx and ChatThread.tsx (keyboard safe). Also provide QA checklist and motion specs. Output each part as a separate markdown section and include code blocks.

---

## Final note / Tone for the LLM

Be explicit, concrete, and pragmatic. Deliver copy/pasteable Figma tokens, React Native TSX files, and API examples. Prioritize keyboard safety, privacy-by-default, and platform authenticity. Keep motions subtle and the app calm.

---

If you want, I can now:

- produce the **actual prompt payload** formatted for a specific model (Claude Sonnet or Gemini), or
- start generating the **starter repo files** (App.tsx, Surface.tsx, JournalScreen.tsx, ChatThread.tsx) right away. Which would you like next?
