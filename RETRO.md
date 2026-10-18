# Retro — Daniruk frontend build

Date: 2026-10-18. Scope: tickets 01–12 from `TICKETS.md` against `SPEC.md`.

## Final code review (skill: code-review, fixed point `5e72e06` → working tree)

Two axes, run as parallel sub-agents. Verdicts: **Standards — mostly pass, one systemic nit; Spec — strong pass, two items needing a decision.**

### Standards findings → decisions

1. **`src/components/palette.ts` is a second color source outside `theme/tokens.ts`** (SPEC: "no magic numbers"). *Documented.* The file is a deliberate extension point for component-only colors (per SPEC resolution 9, states not in the designs extend the theme freely). A future cleanup could fold it into `tokens.ts`.
2. **Magic numbers in screen styles** (radio dots 20/10, success circles 96, `44` where the `hitTarget` token exists). *Documented as a nit sweep* — cosmetic token drift, no behavior impact.
3. **`KeyboardAvoiding` sets `behavior` but no `keyboardVerticalOffset`** (SPEC: "platform-specific offsets"). *Documented.* The wrapper sits under headerless routes, so offset 0 is correct today; add an offset prop if a native header is ever introduced.
4. **Duplicated Code (smell, judgement call)** — pushed-screen header, radio-row picker, `SummaryRow`, and success state exist both in `serviceShared.tsx` and inline in the older trade/wallet screens. *Documented as the top refactor candidate*: promote the four shared pieces from `src/screens/services/serviceShared.tsx` to `src/components/` and migrate `TradeCardDetailsScreen`, `TradeReviewScreen`, `WithdrawScreen`.
5. **`WithdrawScreen.tsx` is 602 lines** (Divergent Change, judgement call). *Documented*; splitting `BankForm`/`CryptoForm` out pairs naturally with item 4.

### Spec findings → decisions

1. **Story 45 mentions a "fee" row in transaction detail, but the `Transaction` contract in the same SPEC has no fee field.** *Documented as a spec-internal inconsistency* — the contract wins; no fee data invented. Recommend amending SPEC story 45 or adding `feeKobo` to the contract later.
2. **SPEC lists a `bills` data module; `payBill` lives in `src/data/services.ts`.** *Documented as deliberate consolidation* — bill payments are services; the swap-a-real-backend seam is unaffected.
3. **Flights booking debits the wallet and records a transaction**, beyond story 40's "start a booking (mock)". *Kept, documented.* The seeded ledger already models a paid flight (`Flight LOS → ABV`), so booking-with-payment stays consistent with the persona and the "payments appear in Transactions" pattern. Flagged as the edge of MVP scope.
4. **Profile actions are toast placeholders.** *Documented* — consistent with resolution 8's placeholder approach; real edit-profile/security/support screens are post-MVP.
5. ~~`AmountInput` misplaced outside `components/`~~ — **review error**: `AmountInput` is at `src/components/AmountInput.tsx` as spec'd; only the deliberately unshared `UsdAmountInput` is screen-local.

## What went well

- The mock data layer paid off exactly as designed: trades credit, withdrawals and bills debit, and every screen reads through the same seam. A real backend can replace `src/data/` without touching screens.
- The screens-outside-`src/app/` convention (route = thin wrapper) kept route files trivial and made every screen testable with `@testing-library/react-native`.
- Tokens-first styling meant the late design-fidelity pass (ticket 11) found almost no visual drift.
- Final state: `tsc --noEmit` clean, `expo lint` clean, **36 jest suites / 226 tests green**, and `expo export` bundles for iOS and Android.

## What was harder than expected

- **Expo Router typed routes** (`experiments.typedRoutes`) only regenerate while the dev server runs; several false `tsc` errors cost time until the regen ritual (start server → poll `.expo/types/router.d.ts` → kill) became standard practice.
- **The Trade tab route was left pointing at its placeholder** after the brand-list screen landed — the tab shell and the flow were built in different tickets and nobody re-checked the wrapper. The ticket-11 pass caught it. Lesson: a ticket isn't done until its entry points render the real screen, not just until the screen exists.
- **Jest mock-factory rules** (the `mock`-prefix restriction, `useFocusEffect` in `expo-router` mocks, interfaces failing the `useLocalSearchParams` generic constraint) bit repeatedly; all three are now encoded in the test idioms under `src/screens/**/__tests__/`.
- **Date-sensitive fixtures** (`hoursAgo(2)`) flaked across midnight; tests now assert recency windows instead of calendar days.

## Known limitations (accepted)

- `expo-clipboard` is not installed; `src/lib/clipboard.ts` falls back to a mock copy. Install with `npx expo install expo-clipboard` before shipping.
- Cross-platform verification was via dual-platform `expo export`, the platform-aware shadow helper, safe-area usage, and the test suite — no on-device/simulator run was performed in this build.
- Component states not present in the designs (pressed/disabled/loading/empty/error) extend the theme per resolution 9 and are the main candidates for a future design review.
