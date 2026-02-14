# MoneyLife — UI Redesign Spec (Game Feel Overhaul)

**Date:** February 14, 2026  
**Goal:** Transform MoneyLife from "banking dashboard" to "game you can't put down"  
**Target:** Web app only (Next.js, inline styles via design-tokens.ts)  
**Constraint:** No new npm dependencies unless essential (Framer Motion OK). All inline styles.

---

## Design Philosophy

**Current:** Light gray background, white cards, purple gradients. Looks like a fintech admin panel.  
**Target:** Dark theme with glowing accents, animated feedback, visual delight at every interaction.

**References:**
- Fortune City (pixel art world-building from finances)
- Duolingo (celebration animations, streak pressure)
- Cash App (dark theme, bold typography, satisfying interactions)
- The iBank/FinPay design kit (we own it — use the card/transfer patterns, but in dark mode)

---

## 1. Design Tokens Overhaul

Replace `apps/web/src/lib/design-tokens.ts` entirely:

```typescript
export const colors = {
  // Core
  primary: '#6366F1',        // Indigo 500 (slightly lighter for dark bg)
  primaryLight: '#818CF8',   // Indigo 400
  primaryDark: '#4338CA',    // Indigo 700
  primaryGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  
  // Backgrounds (DARK THEME)
  background: '#0F0B1E',     // Deep dark purple-black
  backgroundSecondary: '#1A1333',  // Slightly lighter for cards
  surface: '#211B3A',        // Card surface
  surfaceHover: '#2A2248',   // Card hover state
  surfaceElevated: '#2D2545', // Elevated cards (modals, decisions)
  
  // Card gradient (the Visa card)
  cardGradient: 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)',
  
  // Text
  textPrimary: '#F1F0FF',    // Almost white with purple tint
  textSecondary: '#A5A0C8',  // Muted purple-gray
  textMuted: '#6B6490',      // Very muted
  
  // Accents
  success: '#34D399',        // Emerald 400 (brighter for dark bg)
  danger: '#FB7185',         // Rose 400
  warning: '#FBBF24',        // Amber 400
  accentCyan: '#22D3EE',     // Cyan 400 (new — for XP, streaks)
  accentPink: '#F472B6',     // Pink 400
  accentGold: '#FCD34D',     // Gold for legendary/coins
  
  // Borders
  border: '#2D2545',
  borderLight: '#1E1838',
  borderGlow: 'rgba(99, 102, 241, 0.3)',  // Purple glow for focus
  
  // Input
  inputBg: '#1A1333',
  
  // Glow effects
  glowPrimary: '0 0 20px rgba(99, 102, 241, 0.4)',
  glowSuccess: '0 0 15px rgba(52, 211, 153, 0.3)',
  glowDanger: '0 0 15px rgba(251, 113, 133, 0.3)',
  glowGold: '0 0 20px rgba(252, 211, 77, 0.4)',
  glowCyan: '0 0 15px rgba(34, 211, 238, 0.3)',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 };

export const shadows = {
  card: '0 2px 12px rgba(0, 0, 0, 0.3)',
  elevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
  bankCard: '0 8px 32px rgba(67, 56, 202, 0.35)',
  glow: '0 0 30px rgba(99, 102, 241, 0.2)',
  none: 'none',
};

// Animation keyframes to inject into layout.tsx <style> tag
export const globalAnimations = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes xpGrow { from { width: 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); } 50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); } }
  @keyframes coinFloat { 
    0% { transform: translateY(0); opacity: 1; } 
    100% { transform: translateY(-40px); opacity: 0; } 
  }
  @keyframes confettiBurst {
    0% { transform: scale(0) rotate(0); opacity: 1; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  @keyframes cardFlip {
    0% { transform: perspective(800px) rotateY(0); }
    50% { transform: perspective(800px) rotateY(90deg); }
    100% { transform: perspective(800px) rotateY(0); }
  }
  @keyframes streakFire {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }
`;
```

---

## 2. Page-by-Page Redesign

### 2.1 Landing Page (`app/page.tsx`)

**Current:** Light background, purple header, 6 feature cards  
**Redesign:**
- Full dark background (#0F0B1E)
- Hero with large animated money emoji/illustration floating
- Gradient text for "MoneyLife" heading (purple → cyan)
- Feature cards with dark surface + subtle border glow on hover
- CTA buttons with glow effect on hover
- Bottom: social proof section (placeholder for when we have users)

### 2.2 Login / Register (`app/(auth)/login/page.tsx`, `register/page.tsx`)

**Current:** Centered white card on light gray  
**Redesign:**
- Dark background with subtle animated gradient orbs (CSS-only, background blobs)
- Login card uses `surface` color with `borderGlow` border
- Input fields: dark input background, purple focus ring with glow
- Button: gradient with glow on hover
- Keep it clean — just darker and moodier

### 2.3 Dashboard / Game List (`app/(app)/dashboard/page.tsx`)

**Current:** Purple header, long list of game cards (all identical purple gradients)  
**Redesign:**
- Dark background throughout
- Greeting: "Hey, Andrei 👋" with subtle glow text
- **Game cards redesigned:** Each persona has a distinct color scheme:
  - Teen 🎒: gradient teal → cyan
  - Student 🎓: gradient indigo → purple (current)
  - Young Adult 💼: gradient purple → pink
  - Parent 👨‍👩‍👧: gradient amber → orange
- Card shows: persona emoji (large), level, XP progress bar, net worth, streak fire if active
- Card hover: scale(1.02) + glow effect
- "Start new game" button: dashed border card with glow pulse, large "+" icon
- **Max 4 games shown** (others behind "Show more") — too many clutters
- Delete game ability (trash icon with confirmation)

### 2.4 Game Main Screen (`app/(app)/game/[gameId]/page.tsx`) — THE BIG ONE

**Current:** 520 lines, light theme, super long scroll with everything on one page  
**Redesign: Split into focused sections with tab-based navigation**

**Header (stays):**
- Dark gradient header with persona emoji, level, difficulty badge
- XP bar: cyan glow (`accentCyan`), animated fill
- Keep compact

**Hero Card (Net Worth):**
- Dark gradient card (keep the Visa-style look)
- Add subtle 3D tilt on hover (CSS perspective transform)
- Animated balance counter (count-up effect when value changes)
- Shimmer/gloss animation across card surface

**Stats Row:**
- 4 stat cards in a row, dark surface
- Each stat has its own accent color:
  - Net Worth: purple
  - Income: cyan
  - Budget: green/red based on score
  - Credit Health: green/red based on score
- Stat values should be large and bold
- Mini sparkline or progress bar under each

**Day Control (PROMINENT):**
- Large day counter: "DAY 13" in big bold text with date below
- "Advance Day" button: **large, centered, glowing, pulsing** — the primary CTA
  - Idle: subtle pulse animation
  - Hover: intensified glow
  - Click: satisfying "press" animation (scale down then up)
  - After advance: show day summary overlay (what happened)

**Decision Cards Section (REDESIGNED — this is critical):**
- Section header: "⚡ Decisions Awaiting" with count badge
- Cards are now **horizontally scrollable** if multiple, or **single prominent card**
- Each decision card preview shows:
  - Category emoji + colored top border (health=green, entertainment=pink, housing=purple, etc.)
  - Title in bold
  - Description
  - "Decide →" pill button with glow
- **Tap opens full-screen decision view** (see 2.5)

**Quick Actions Grid:**
- 2×3 grid of icon buttons, dark surface
- Each with emoji + label
- Subtle hover glow in the button's color

**Accounts Section:**
- Dark cards with account type icon
- Balance right-aligned, colored (green positive, red negative)
- Click → account detail page

**Bills Section:**
- Dark cards with bill name, amount, due date
- Autopay toggle: pill toggle switch (green when on)
- Overdue bills: red glow border

**Recent Activity:**
- Transaction list with category-colored left border
- Income: green text, expenses: red text
- Category icon + description + amount
- **Limit to 5 most recent** with "View all →" link

**Bottom Navigation:**
- Dark background, blur effect (backdrop-filter)
- Active tab: icon + label in primary color with glow
- Inactive: muted icons
- 4 tabs: Dashboard, Social, Ranks, Classroom

### 2.5 Decision Card Full Screen (`app/(app)/game/[gameId]/card/[cardId]/page.tsx`)

**Current:** Purple header, basic list of options with colored badges  
**THIS IS THE MOST IMPORTANT SCREEN. Make it feel like a real game moment.**

**Redesign:**
- Full dark background
- **Top section:** Large category illustration area
  - Category emoji displayed HUGE (64px) with colored glow behind it
  - Category name as pill badge below
  - Card title: 24px bold white text
  - Description: secondary text, centered
- **Visual separator** (subtle gradient line)
- **Options as big tappable cards:**
  - Each option is a dark surface card with left color border
  - Option text: bold, 16px
  - Effects shown as pills below: 
    - Cost: red pill with money icon (💰 RON 50)
    - XP: cyan pill (⭐ +12 XP)
    - Coins: gold pill (🪙 +6)
    - Happiness: pink pill (😊 +5) or red (😢 -3)
  - **Selected state:** purple border + glow + checkmark
  - Hover: scale(1.01) + border glow
- **AI Hint button:** Smaller, below options, dark surface, "🤖 Ask AI (50 coins)" — premium feel
- **Confirm Decision button:** 
  - Full-width, gradient, ONLY enabled when option selected
  - Disabled state: gray, muted
  - Active: glow + pulse
  - Click animation: scale press → confetti-like particle burst

### 2.6 Rewards & Badges (`app/(app)/game/[gameId]/rewards/page.tsx`)

**Current:** Big "1" number, 7 identical medal emojis. Boring.  
**Redesign:**
- Dark background
- **Level showcase at top:**
  - Current level number displayed HUGE (80px) with glow
  - Level name if available (e.g., "Beginner", "Rising Star")
  - XP bar underneath: full width, animated, cyan glow
  - "1,042 XP to Level 2" text below
- **Stats row:** Earned | Locked | Total — dark surface cards with count
- **Badge categories as tabs:**
  - Savings | Credit | Budget | Investment | Life | Engagement | Progression
  - Horizontal scrollable tab bar
- **Badge grid (per category):**
  - Earned badges: full color, rarity-colored glow border
    - Common: gray border
    - Rare: blue glow
    - Epic: purple glow  
    - Legendary: gold glow + shimmer animation
  - Locked badges: dark, desaturated, "?" overlay, name hidden
  - Badge card shows: emoji/icon, name, rarity tier
  - Click badge → detail modal with description, how earned / how to earn, coin+XP reward
- **"Next Badge" highlight at top:**
  - Shows the closest badge to earning with progress bar
  - "Complete 2 more savings deposits to earn 'Consistent Saver' 🏆"
- **Streak section at bottom:**
  - Current streak with fire animation (🔥)
  - Streak calendar (last 30 days, green dots for active days, gray for missed)
  - Current multiplier display
  - Streak shield status

### 2.7 Leaderboard (`app/(app)/leaderboard/page.tsx`)

**Current:** Flat list with 2 entries  
**Redesign:**
- Dark background
- **Podium for top 3:**
  - 2nd place (left, shorter) | 1st place (center, tallest, gold glow) | 3rd place (right, shortest)
  - Each shows: avatar circle with first letter, username, net worth, level
  - 1st place: gold glow, crown emoji
  - 2nd: silver
  - 3rd: bronze
- **Your rank card** (highlighted): dark surface with purple border glow
- **Rest of rankings:** clean list with rank number, avatar, name, net worth
- **Tab bar:** Global | Friends | By Level | Weekly XP | Best Credit | Badges
- **Empty state:** "Challenge friends to climb the ranks! 🏆" with invite button

### 2.8 Budget Page (`app/(app)/game/[gameId]/budget/page.tsx`)

**Current:** Actually decent! Ring chart + sliders  
**Redesign (lighter touch):**
- Dark theme treatment (backgrounds, text colors)
- Ring chart: glow effect, animated segments
- Category color dots match ring segments
- Sliders: custom styled with thumb glow on drag
- "Save Budget" button: gradient with success glow on save
- Over-budget categories: red glow border + warning icon

### 2.9 Transfer Page

- Dark theme
- From/To account selector: dark dropdowns
- Amount input: large centered text (like Cash App's amount entry)
- Preview card before confirming
- Success: green checkmark animation

### 2.10 Monthly Report

- Dark theme
- Income vs Expenses chart (bar chart with colored bars)
- Summary cards for key metrics
- Compare to previous month (if available)

---

## 3. Component Design System

### 3.1 New Components Needed

```
src/components/
  CelebrationOverlay.tsx    -- Confetti/particle effects for badges, level-ups
  StreakCounter.tsx          -- Fire emoji + counter + multiplier display
  XPFloater.tsx             -- "+15 XP" floating animation
  BadgeReveal.tsx           -- Full-screen badge unlock animation
  DayTransition.tsx         -- Animated day counter change
  ProgressRing.tsx          -- Reusable animated ring chart
  GlowButton.tsx            -- Primary button with hover glow
  StatCard.tsx              -- Reusable dark stat card
  GameCard.tsx              -- Dashboard game card with persona colors
```

### 3.2 Global Styles (layout.tsx)

Add to `<head>`:
```html
<style>
  /* Import animations from design-tokens */
  ${globalAnimations}
  
  /* Global dark theme */
  body { 
    background: #0F0B1E; 
    color: #F1F0FF; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1A1333; }
  ::-webkit-scrollbar-thumb { background: #2D2545; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #4338CA; }
  
  /* Selection */
  ::selection { background: rgba(99, 102, 241, 0.3); }
  
  /* Remove tap highlight on mobile */
  * { -webkit-tap-highlight-color: transparent; }
```

---

## 4. Category Visual System

Each decision card category gets a distinct color + emoji:

| Category | Color | Emoji | Glow |
|----------|-------|-------|------|
| Housing | #7C3AED (violet) | 🏠 | violet |
| Food/Groceries | #EA580C (orange) | 🍽️ | orange |
| Transport | #6B7280 (gray) | 🚗 | gray |
| Entertainment | #DB2777 (pink) | 🎬 | pink |
| Health | #059669 (emerald) | 💊 | green |
| Education | #7C3AED (violet) | 📚 | violet |
| Shopping | #EC4899 (pink) | 🛍️ | pink |
| Social | #F59E0B (amber) | 👥 | amber |
| Emergency | #EF4444 (red) | 🚨 | red |
| Savings | #2563EB (blue) | 💰 | blue |
| Investment | #059669 (emerald) | 📈 | green |
| Insurance | #0891B2 (cyan) | 🛡️ | cyan |
| Salary/Income | #10B981 (green) | 💵 | green |

---

## 5. Interaction Patterns

### Hover Effects (desktop)
- Cards: scale(1.02) + box-shadow glow in accent color
- Buttons: brightness increase + glow
- Quick actions: icon scale(1.1)

### Tap Feedback (mobile)
- Active state: scale(0.98) + darken
- Buttons: scale(0.95) for 100ms → scale(1)

### Transitions Between Pages
- CSS transition on main content: fadeIn + slideUp (200ms)
- Bottom nav: instant, no transition

### Loading States
- Skeleton with shimmer (dark theme shimmer: #1A1333 → #2D2545 → #1A1333)
- Keep current skeleton pattern, just dark colors

---

## 6. Implementation Chunks (for Claude Code)

### Chunk A: Dark Theme Foundation + Design Tokens + Layout + Landing + Auth
**Files:** `design-tokens.ts`, `layout.tsx`, `page.tsx` (landing), `login/page.tsx`, `register/page.tsx`
**Scope:** ~400 lines changed
- Replace design tokens
- Add global animations + dark body to layout
- Restyle landing page (dark bg, gradient text, glow cards)
- Restyle login/register (dark card, glowing inputs)

### Chunk B: Game Main Screen + Dashboard Restyle
**Files:** `dashboard/page.tsx`, `game/[gameId]/page.tsx`
**Scope:** ~800 lines (biggest rewrite)
- Dashboard: dark theme, persona-colored game cards, hover effects
- Game page: dark theme, all sections restyled, decision cards as horizontal scroll, better visual hierarchy
- Day control: prominent pulsing button
- Transaction list: limited to 5, category colored borders
- Bottom nav: dark with blur

### Chunk C: Decision Card + Rewards + Leaderboard + Budget
**Files:** `card/[cardId]/page.tsx`, `rewards/page.tsx`, `leaderboard/page.tsx`, `budget/page.tsx`  
**Scope:** ~600 lines
- Decision card: full-screen game moment, big category emoji, option cards with glow selection
- Rewards: badge categories, rarity glow, next badge progress, streak section
- Leaderboard: top-3 podium, tab types
- Budget: dark treatment, glow ring

---

## 7. What We're NOT Doing (Yet)

- No Framer Motion (CSS animations only for now)
- No sound effects
- No celebration overlay/confetti (Sprint 1 of gamification overhaul — separate)
- No visual life scenes (Sprint 4)
- No new backend endpoints
- No mobile app changes

This spec is purely: **make the existing screens feel like a game instead of a banking admin panel.**

---

## 8. Success Criteria

After implementation, when a user opens MoneyLife they should:
1. **Feel** the dark theme is premium and game-like (not corporate)
2. **Notice** the decision cards immediately (not buried in a list)
3. **Want** to tap the Advance Day button (it looks inviting, alive)
4. **Enjoy** hovering/tapping elements (everything responds with glow/animation)
5. **Care** about their stats (they look dramatic, not like a spreadsheet)
6. **Explore** rewards (badge rarity creates curiosity)
7. **Compare** on leaderboard (podium creates competitive energy)
