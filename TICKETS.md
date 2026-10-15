# Tickets — Daniruk Frontend

Broken down from `SPEC.md` (approved 2026-10-14). Tracer-bullet slices: each ticket delivers demoable end-to-end behavior and includes its own tests. Work the frontier: a ticket starts when everything in "Blocked by" is done.

---

## 01: Scaffold + design system foundation

**Blocked by:** None (can start immediately)

**What it delivers:** A bootable Expo app (strict TS, Expo Router, jest) with the full token system from SPEC.md (colors, Inter type scale, spacing, radius, platform-aware shadows), `ThemeProvider` with font loading, and a passing test toolchain. *(In progress — delegated.)*

---

## 02: Domain model + mock data layer

**Blocked by:** 01

**What it delivers:** `data/types.ts` with every contract from SPEC.md; the eight mock data modules (auth, wallet, transactions, trade, services, bills, notifications, referrals) with simulated latency and the Adebayo persona fixtures; `lib/` utilities (₦/crypto formatting, validators, greeting) and `useAsync` hook; unit tests for all of it. Real backend can later replace `data/` without touching screens. *(In progress — delegated, bundled with 01.)*

---

## 03: Component library

**Blocked by:** 01

**What it delivers:** Every component in SPEC.md's inventory — Button (primary/accent/ghost; pressed/disabled/loading), TextField (focus/error/secure-toggle), SegmentedToggle, OTPInput, AmountInput, ScreenHeader, Logo, WalletCard, BannerCard, ServiceTile, TransactionRow, StatusBadge, SectionHeader, TabBar (raised center Trade), Avatar, Pill, EmptyState, ErrorState, Loading, BottomSheet, Toast, ListItem — with component tests for interactive states. No screens yet; components render in isolation.

---

## 04: Auth flow (onboarding, login, signup, OTP, forgot password)

**Blocked by:** 02, 03

**What it delivers:** A new user sees onboarding (design `1.png`, hero rebuilt in RN/SVG), can create an account (design `5.png`), verify via mock OTP, and land in the app; a returning user logs in (design `2.png`) and lands in the app. Validation errors, loading states, and the session gate (unauthenticated → auth group) all work. Pixel-fidelity checked against `1.png`, `2.png`, `5.png` on both platforms before done.

---

## 05: Home + tab shell

**Blocked by:** 02, 03

**What it delivers:** The 5-tab shell with the raised center Trade button, and the Home screen (designs `3.png` + `4.png`): greeting, wallet card with hide/show balance, crypto row, Receive/Withdraw, trade banner, quick services, referral card, recent transactions, Daniruk Secure note — all live from the mock layer, with loading/empty/error states. Pixel-fidelity checked against `3.png`/`4.png` on both platforms.

---

## 06: Transactions list + detail

**Blocked by:** 05

**What it delivers:** The Transactions tab lists all ~20 mock transactions filterable by type, with status badges and an empty state per filter; tapping a row opens the detail screen (amount, fee, reference, status, timestamp, meta rows). Home's "See all" routes here.

---

## 07: Trade flow

**Blocked by:** 05

**What it delivers:** From the Trade tab: browsable/searchable brand list with live rates → card details form (validated, photo placeholder) → review screen with quote math from the mock layer → confirm bottom sheet → success screen → the new trade appears in Transactions and the NGN balance increases.

---

## 08: Wallet receive + withdraw

**Blocked by:** 05

**What it delivers:** Receive shows per-asset (BTC/USDT) address with copy feedback; Withdraw offers NGN-to-bank (saved accounts, add-account form with resolved name) and crypto-to-address, both validated (min/max/balance), with confirmation and success/error feedback. Home's Receive/Withdraw buttons route here.

---

## 09: Services

**Blocked by:** 05

**What it delivers:** The Services tab lists all services; Airtime, Data, and Electricity each have their validated purchase form (network/plan/disco pickers, phone/meter validation) with review + pay confirmation and success/failure feedback; Flights has a search form returning mocked results. Payments appear in Transactions.

---

## 10: Profile, referrals, notifications

**Blocked by:** 05

**What it delivers:** Profile tab (identity header, menu list, log out → back to auth); Referrals screen (code, copy/share, earnings summary) reached from the Home referral card; Notifications screen with read/unread states, opened from the bell with its badge clearing.

---

## 11: Cross-platform + pixel-fidelity verification pass

**Blocked by:** 04, 05, 06, 07, 08, 09, 10

**What it delivers:** Every designed screen (1–5) re-compared against its PNG (layout, spacing, typography, colors, radii, shadows, all component states); every screen exercised on Android and iOS with platform quirks fixed explicitly; full `tsc` + jest green.

---

## 12: Final code review + retro

**Blocked by:** 11

**What it delivers:** The `code-review` skill run over the whole diff against SPEC.md and the designs; inconsistencies fixed or documented; a short retro written into `RETRO.md`.
