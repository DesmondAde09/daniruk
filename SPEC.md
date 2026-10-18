# Daniruk — Frontend Spec

**Status:** Draft, awaiting sign-off
**Scope:** React Native (Expo, TypeScript strict) frontend only. No backend, no real API calls.
**Source of truth for visuals:** `/Users/mac/Documents/projects/design/1.png` … `5.png`

## Problem Statement

Adebayo holds gift cards and crypto but has no single trusted place to turn them into usable Naira, and paying for everyday services (airtime, data, electricity, flights) means juggling several apps. He wants one app where he can see his money, trade gift cards at a fair rate, move crypto, and pay bills — that feels secure and polished on both Android and iOS.

## Solution

Daniruk is a mobile app with a wallet-first home screen, a guided gift-card trading flow, crypto receive/withdraw, bill payments, referrals, and a full transaction history. This spec covers the **frontend only**: every screen is powered by a typed mock data layer with simulated latency, structured so real endpoints can replace mocks without touching screens.

Questionnaire resolutions (user-approved defaults, 2026-10-14):

1. MVP scope: auth, home, gift-card trading, crypto wallet (receive/withdraw), bill payments (flights, electricity, airtime, data), referrals, transactions, profile.
2. Trade flow: pick brand → enter card details (+ photo placeholder) → see rate & payout in ₦ → confirm → success, funds land in NGN wallet.
3. Crypto: BTC + USDT, receive/withdraw only (no buy/sell).
4. Withdraw: saved bank accounts list + add-account form; no KYC flow.
5. Flights: simple search form → mocked results list.
6. Trade is a dedicated tab screen (raised center tab), not a modal.
7. Mock OTP screen after signup; login goes straight to Home; no biometrics.
8. Forgot password is a single themed placeholder screen.
9. Loading/empty/error states extend the theme freely; flagged in code review.
10. Mock persona: Adebayo Okafor, ₦348,200.00 NGN, 0.0048 BTC, ~20 transactions, filterable by type.
11. Latest Expo SDK, managed workflow.
12. Onboarding hero illustration recreated in code (RN primitives), no image assets.
13. Font: Inter via `@expo-google-fonts/inter`.
14. App lives at the repo root.
15. The blue toggle outline in `2.png`/`5.png` is treated as a focus-ring artifact — active segmented-control state uses the dark-green brand outline instead.

## User Stories

**Onboarding & auth**

1. As a new user, I want a welcome screen that explains what Daniruk does, so that I understand the value before signing up.
2. As a new user, I want to create an account with my full name, email, and password, so that I can start using the app.
3. As a new user, I want to verify my account with an OTP code after signup, so that my account is secured.
4. As a returning user, I want to log in with email and password, so that I can access my wallet.
5. As a returning user, I want to show/hide my password while typing, so that I can avoid typos without exposing it.
6. As a user, I want to switch between Log in and Sign up from a single screen, so that I don't hunt for the right page.
7. As a user who forgot my password, I want a forgot-password screen, so that I know recovery exists (placeholder flow).
8. As a user, I want validation errors on auth fields (bad email, short password, empty name), so that I can fix mistakes before submitting.
9. As a user, I want a visible "Secured / bank-grade encryption" signal on auth screens, so that I trust the app with my money.

**Home**

10. As a user, I want to see my NGN wallet balance prominently, so that I know how much money I have.
11. As a user, I want to hide/show my balance with an eye toggle, so that I can protect it in public.
12. As a user, I want to see my crypto balance summary on the wallet card, so that I have a full picture of my funds.
13. As a user, I want Receive, Add money, Transfer, and Withdraw actions on the wallet card, so that I can move money in one tap.
14. As a user, I want to transfer money to any Nigerian bank account with recipient name verification, so that I can pay people from my wallet.
15. As a user, I want a prominent gift-card trading entry point, so that I can start a trade immediately.
16. As a user, I want quick access to everyday services (Flights, Electricity, Airtime, Data), so that I can pay bills fast.
17. As a user, I want a "View all" link to the full services list, so that I can find less common services.
18. As a user, I want to see a refer-and-earn card, so that I can invite friends and earn.
19. As a user, I want to see my most recent transactions on Home, so that I can confirm recent activity at a glance.
20. As a user, I want a notification bell with an unread indicator, so that I know when something needs attention.
21. As a user, I want a personalized greeting (time-of-day aware), so that the app feels alive.
22. As a user, I want a visible "Protected by Daniruk Secure" note, so that I trust every transaction is monitored.

**Trade (gift cards)**

23. As a user, I want to browse gift-card brands with their current rates, so that I can pick the best one.
24. As a user, I want to search/filter brands, so that I can find my card quickly.
25. As a user, I want to enter card details (brand, country/currency, value range, amount), so that the app can compute my payout.
26. As a user, I want to optionally add a card photo (placeholder picker), so that the trade can be verified later.
27. As a user, I want to see the live rate and exact NGN payout before confirming, so that there are no surprises.
28. As a user, I want a confirmation step summarizing the trade, so that I can double-check before committing.
29. As a user, I want a success screen after confirming, so that I know the funds are on the way to my NGN wallet.
30. As a user, I want my completed trade to appear in my transactions, so that I have a record.

**Wallet — receive & withdraw**

31. As a user, I want to see my crypto receiving address per asset (BTC, USDT) with a copy button and QR-style placeholder, so that I can receive funds.
32. As a user, I want to withdraw NGN to a saved bank account, so that I can cash out.
33. As a user, I want to add a new bank account (bank picker, account number, resolved account name), so that I can withdraw where I want.
34. As a user, I want to withdraw crypto to an external address with amount + address validation, so that I can move my assets.
35. As a user, I want clear error states for invalid amounts (below minimum, above balance), so that I don't submit doomed withdrawals.

**Services**

36. As a user, I want a services index screen listing all bill-payment services, so that I can find any of them.
37. As a user, I want to buy airtime (network picker, phone, amount), so that I can top up.
38. As a user, I want to buy data (network, plan picker, phone), so that I can stay online.
39. As a user, I want to pay electricity (disco picker, meter number, meter type, amount), so that my power stays on.
40. As a user, I want to search flights (from, to, date, passengers) and see mocked results, so that I can start a booking (mock).
41. As a user, I want a review + pay confirmation for each service, so that I know what I'm paying before it happens.
42. As a user, I want success/failure feedback after paying, so that I know the outcome.

**Transactions**

43. As a user, I want a full transaction list grouped/scrollable, so that I can review my history.
44. As a user, I want to filter transactions by type (trade, service, receive, transfer, withdraw), so that I can find what I need.
45. As a user, I want a transaction detail view (amount, fee, reference, status, timestamp), so that I can audit any entry.
46. As a user, I want clear status badges (Successful, Pending, Failed), so that I can see state at a glance.
47. As a user, I want an empty state when a filter matches nothing, so that the screen never looks broken.

**Profile, referrals, notifications**

48. As a user, I want a profile screen with my name, email, and avatar initials, so that I can confirm my identity.
49. As a user, I want profile actions (edit profile, security, support, log out) as a clean list, so that account management is findable.
50. As a user, I want a referrals screen with my invite code/link and earnings summary, so that I can share it.
51. As a user, I want a notifications list with read/unread states, so that I can catch up.
52. As a user, I want to log out and return to the auth flow, so that my account stays safe on shared devices.

**Cross-cutting**

53. As a user, I want every async screen to show a themed loading state, so that waits feel intentional.
54. As a user, I want every screen to render correctly on Android and iOS, so that the app feels native on my phone.
55. As a user, I want the ₦ symbol to render correctly on both platforms, so that amounts are never ambiguous.

## Screen List & Navigation (Expo Router)

File-based routing under `app/`. Auth group is a stack; the main app is a 5-tab layout; flows push on top of tabs.

```
app/
  _layout.tsx                 Root stack; font loading; theme provider; auth gate
  index.tsx                   Onboarding / Welcome            [DESIGN 1.png]
  (auth)/
    _layout.tsx               Auth stack (white sheet style)
    login.tsx                 Log in                          [DESIGN 2.png]
    signup.tsx                Sign up                         [DESIGN 5.png]
    otp.tsx                   OTP verification (mock)         [extends theme]
    forgot-password.tsx       Placeholder                     [extends theme]
  (tabs)/
    _layout.tsx               Custom 5-tab bar; raised center Trade button
    index.tsx                 Home                            [DESIGN 3.png + 4.png]
    trade.tsx                 Trade: brand list + rates       [extends theme]
    services.tsx              Services index                  [extends theme]
    transactions.tsx          Transactions list + filters     [extends theme]
    profile.tsx               Profile                         [extends theme]
  trade/
    [brandId].tsx             Trade: card details form        [extends theme]
    review.tsx                Trade: rate & payout review     [extends theme]
    success.tsx               Trade: success                  [extends theme]
  services/
    airtime.tsx               [extends theme]
    data.tsx                  [extends theme]
    electricity.tsx           [extends theme]
    flights.tsx               Search + mocked results         [extends theme]
  wallet/
    receive.tsx               Per-asset address + copy        [extends theme]
    add-money.tsx             Add money: funding methods      [some_screens/2.jpg]
    bank-transfer.tsx         Add money: bank transfer        [some_screens/1.jpg]
    withdraw.tsx              NGN bank or crypto withdraw     [extends theme]
    add-bank-account.tsx      Bank picker + account number    [extends theme]
    transfer.tsx              NGN transfer to any bank        [extends theme]
  transactions/
    [id].tsx                  Transaction detail              [extends theme]
  referrals.tsx               Refer & earn                    [extends theme]
  notifications.tsx           Notifications list              [extends theme]
```

- Auth gate: a mock session store decides whether `/` redirects to onboarding or `/(tabs)`.
- The raised Trade tab routes to `/(tabs)/trade` like any other tab; only its tab-bar rendering is special.

## Design System (extracted from the design files)

> **Retheme (2026-10-18):** the brand color is now **gold**, not green. The `green.*` ramp below was replaced by a `gold.*` ramp and `lime.400` by `accent.400` in `theme/tokens.ts` (gold.950 `#231D0F`, gold.900 `#3E3212`, gold.800 `#57451A`, gold.700 `#8A6D1F`, gold.100 `#F3E7C1`, gold.50 `#FBF4DC`, accent.400 `#F2C24B`); neutrals were warmed to match. Semantic status colors are unchanged. The green values below are kept as the historical record of the original designs.

All values live in `theme/tokens.ts`. Screens consume tokens; no magic numbers.

### Colors (sampled from PNGs)

| Token | Hex | Used for |
|---|---|---|
| `green.950` | `#15221D` | Headings / near-black text |
| `green.900` | `#193A31` | Onboarding background |
| `green.800` | `#21493C` | Wallet card |
| `green.700` | `#2A5A4A` | Primary buttons, active states, links, eyebrows (light bg) |
| `green.100` | `#DFF1EA` | Transaction icon tint |
| `green.50` | `#E6F5EE` | Airtime icon tile |
| `lime.400` | `#C5EA82` | Accent: CTA on dark, logo badge, trade banner |
| `surface.page` | `#E7EBE8` | Outer page background |
| `surface.base` | `#F5F7F5` | Home background, inactive toggle |
| `surface.subtle` | `#F7F8F6` | Lock-note/info rows |
| `surface.card` | `#FFFFFF` | Cards, inputs, tab bar |
| `text.primary` | `#15221D` | Headings, input text |
| `text.body` | `#56645E` | Body, secondary |
| `text.muted` | `#969E9B` | Placeholders, captions |
| `text.inverse` | `#FFFFFF` | On dark green |
| `purple.200` | `#E7E2FD` | Referral card |
| `purple.100` | `#EFEBFE` | Flights tile |
| `purple.600` | `#7869BA` | Referral illustration |
| `yellow.100` | `#FDF3D9` | Electricity tile |
| `blue.100` | `#EAF2FE` | Data tile |
| `avatar.bg` | `#D9E5DF` | Avatar circle |
| `status.success` | `#2A5A4A` | Successful badge |
| `status.pending` | `#B7791F`-family | Pending badge |
| `status.error` | `#C0392B`-family | Failed badge, field errors |
| `overlay.onDark` | `rgba(255,255,255,0.12)` | Receive/Withdraw buttons on wallet card |

### Typography — Inter (`@expo-google-fonts/inter`)

| Token | Size / Weight / Line-height | Used for |
|---|---|---|
| `display` | 34 / Bold / 40 | Onboarding headline |
| `h1` | 28 / Bold / 34 | Screen titles ("Good to see you again") |
| `h2` | 20 / Bold / 26 | Section titles ("Quick services") |
| `balance` | 32 / Bold / 38 | Wallet balance |
| `body` | 15 / Regular / 22 | Body copy |
| `bodyMedium` | 15 / Medium / 22 | Emphasized body |
| `label` | 14 / SemiBold / 20 | Field labels |
| `button` | 16 / SemiBold / 22 | Button text |
| `eyebrow` | 11 / SemiBold / 14, letterSpacing 1.5, uppercase | "MONEY, MADE SIMPLE", "EVERYDAY" |
| `caption` | 12 / Regular / 16 | Timestamps, hints |

Note: Inter includes ₦ (U+20A6); a formatting util centralizes currency rendering and is unit-tested on both platforms.

### Spacing, radius, shadows

- Spacing scale (4pt): `4, 8, 12, 16, 20, 24, 32, 40, 48`. Screen padding: `24`. Card padding: `20`.
- Radius: `sm 8`, `md 14` (inputs), `lg 20` (cards), `xl 28` (sheets, hero), `pill 999`.
- Shadows: one `card` shadow (soft, low-opacity green-black), applied per platform (iOS shadow props / Android elevation) via a single themed helper.
- Hit targets: minimum 44pt.

## Component Inventory

Built once in `components/`, consumed by all screens.

| Component | Variants / states | Notes |
|---|---|---|
| `Button` | primary (green), accent (lime), ghost; default/pressed/disabled/loading | Loading shows spinner, keeps width |
| `IconButton` | back, notification, eye, copy, eye-off | 44pt hit target |
| `TextField` | default/focused/error/disabled; secure-entry with eye toggle | Label + error message slot |
| `SegmentedToggle` | 2-option (Log in / Sign up); active = white card + green.700 border | Blue outline in PNGs treated as artifact |
| `OTPInput` | 6 cells, auto-advance | Mock verify accepts any 6 digits |
| `AmountInput` | ₦-prefixed numeric, min/max validation | Uses currency util |
| `ScreenHeader` | back + centered logo (auth); logo + bell + avatar (home) | |
| `Logo` | lime badge "D" + "daniruk" wordmark; light/dark variants | |
| `WalletCard` | balance, hidden-balance toggle, crypto row, Receive/Add money/Transfer/Withdraw | Design 4.png |
| `BannerCard` | lime trade banner; purple referral card | |
| `ServiceTile` | pastel icon bg + label (4 color variants) | |
| `TransactionRow` | icon, title, timestamp + ref, signed amount, status badge | |
| `StatusBadge` | Successful / Pending / Failed | |
| `SectionHeader` | eyebrow + title + "View all" link | |
| `TabBar` | 5 tabs, raised center Trade (green circle) | Custom, per design |
| `Avatar` | initials on `avatar.bg` | |
| `Pill` | "Secured" with shield icon | Onboarding |
| `EmptyState` / `ErrorState` / `Loading` | themed, with retry on error | |
| `BottomSheet` | confirmations (trade confirm, pay confirm) | |
| `Toast` | success/error feedback | |
| `ListItem` | profile menu rows | |

## Mock Data Contracts (`data/` layer)

Every screen calls async functions in `data/` (simulated 300–800ms latency, occasional forced-error hooks for testing error states). Swapping in a real backend means re-implementing these functions only.

```ts
type ID = string;
type ISODateString = string;

interface User {
  id: ID;
  fullName: string;        // "Adebayo Okafor"
  email: string;
  avatarInitials: string;  // "AO"
  referralCode: string;
}

interface Wallet {
  ngn: { balanceKobo: number };            // ₦348,200.00 -> 34820000
  crypto: CryptoHolding[];
}

interface CryptoHolding {
  asset: "BTC" | "USDT";
  balance: string;                          // decimal string, e.g. "0.0048"
  address: string;
}

type TransactionType = "trade" | "airtime" | "data" | "electricity" | "flight" | "receive" | "transfer" | "withdraw";
type TransactionStatus = "successful" | "pending" | "failed";

interface Transaction {
  id: ID;
  type: TransactionType;
  title: string;             // "Apple Gift Card"
  amountKobo: number;        // signed: +7125000
  currency: "NGN" | "BTC" | "USDT";
  status: TransactionStatus;
  reference: string;         // "DNR-284910"
  createdAt: ISODateString;
  meta?: Record<string, string>;  // detail screen rows (network, meter no, bank, address…)
}

interface GiftCardBrand {
  id: ID;
  name: string;              // "Apple Gift Card"
  category: string;          // "Gaming" | "Shopping" | "Streaming" | …
  ratePerDollar: number;     // NGN per $1, e.g. 1425
  minUsd: number;
  maxUsd: number;
}

interface TradeQuote {
  brandId: ID;
  amountUsd: number;
  ratePerDollar: number;
  payoutKobo: number;        // amountUsd * ratePerDollar * 100
}

interface BankAccount {
  id: ID;
  bankName: string;
  accountNumber: string;     // 10 digits
  accountName: string;       // "resolved" by mock
}

interface TransferRecipient {  // a verified transfer destination (name enquiry result)
  bankName: string;
  accountNumber: string;     // 10 digits (NUBAN)
  accountName: string;       // resolved by mock name enquiry
}

interface ServicePlan {      // data bundles, electricity discos, networks
  id: ID;
  name: string;
  priceKobo?: number;
}

interface FlightResult {
  id: ID;
  airline: string;
  from: string; to: string;  // airport codes
  departAt: ISODateString; arriveAt: ISODateString;
  priceKobo: number;
}

interface AppNotification {
  id: ID;
  title: string;
  body: string;
  read: boolean;
  createdAt: ISODateString;
}

interface ReferralSummary {
  code: string;
  invitedCount: number;
  earnedKobo: number;
}
```

Data-layer API (one module per feature): `auth`, `wallet`, `transactions`, `trade`, `services`, `bills`, `notifications`, `referrals`. Each exports typed async functions (e.g. `getWallet(): Promise<Wallet>`, `getTradeQuote(input): Promise<TradeQuote>`, `submitTrade(...)`).

## Implementation Decisions

- **Scaffold:** `create-expo-app` (latest SDK, managed workflow) at repo root, TypeScript strict, Expo Router.
- **Key deps:** `expo-router`, `@expo-google-fonts/inter`, `expo-image`, `react-native-svg` (icons + hero illustration), `@tanstack/react-query` NOT used — a thin `useAsync` hook over the mock layer keeps the surface minimal. (Decided: no extra state library; mock session via React context.)
- **Theme:** single `theme/tokens.ts` + `theme/ThemeProvider`; all styling via tokens, `StyleSheet.create` (no NativeWind dependency).
- **The one test seam:** the `data/` layer. Screens and hooks are tested with the mock layer swapped for in-memory fixtures; utilities (currency formatting, validators, rate math, greeting logic) tested directly.
- **Platform handling:** shadows via a themed helper (iOS shadow props, Android elevation); safe areas via `react-native-safe-area-context`; ₦ via Inter + formatting util; keyboard behavior via `KeyboardAvoidingView` with platform-specific offsets; tab bar and sheet layouts tested on both platforms.
- **Auth gate:** root layout checks mock session; unauthenticated → onboarding/auth group, authenticated → tabs. Log out clears session.
- **Onboarding hero:** rebuilt with RN views/SVG (tilted card, floating chips) to match `1.png`.
- **Money math:** integer kobo everywhere; never floats. Crypto amounts as decimal strings.

## Testing Decisions

- **What makes a good test:** external behavior only — what renders, what a press does, what the mock API returns. No snapshot-of-implementation tests, no testing library internals.
- **Tooling:** `jest` + `@testing-library/react-native` (Expo's `jest-expo` preset).
- **Modules tested:**
  - Utilities: currency/₦ formatting, crypto amount formatting, email/password/phone/meter/account-number validators, trade payout math, greeting-by-time, transaction grouping/filtering.
  - Data layer: each `data/` module returns contract-shaped data (type-level + runtime smoke tests).
  - Hooks: `useAsync` states (loading → data, loading → error).
  - Component behavior: `Button` states, `TextField` secure toggle + error, `SegmentedToggle` switching, `TransactionRow` status rendering, `OTPInput` completion. Screen-level smoke tests for the designed screens against mock data.
- **Prior art:** none — greenfield; this spec establishes the pattern.

## Out of Scope

- Any backend, real API calls, real authentication, real payments.
- Buy/sell crypto; KYC flows; real flight booking; real card-image upload (placeholder picker only).
- Push notification delivery; deep links; analytics.
- Web platform.
- Localization beyond English; dark mode (designs are light-theme + dark-green screens only).

## Further Notes

- No issue tracker is configured for this repo (greenfield, no git remote). Per the Matt Pocock skill setup, run `/setup-matt-pocock-skills` if you want tracker-backed wayfinder maps later; for now the spec lives here as the canonical artifact.
- Component states not shown in designs (pressed/disabled/loading/empty/error) extend the theme per questionnaire resolution 9 and will be flagged in code review.
- The ₦ glyph and Android font rendering are known platform risks; the currency util + visual check on both platforms covers them.
