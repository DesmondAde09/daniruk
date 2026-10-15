# Glossary — Daniruk

Domain language for the Daniruk frontend. Implementation details live in `SPEC.md`; this file defines only what words mean.

## People & Identity

- **User** — the person holding the phone. The mock persona is Adebayo Okafor (`avatarInitials` "AO").
- **Account** — a User's registered identity, keyed by email address, protected by a password.
- **Session** — the state of being signed in. Gates access to the main app versus the onboarding/auth flow.

## Money

- **Kobo** — the integer unit in which all NGN amounts are stored and computed (₦1 = 100 kobo). NGN amounts never exist as floats.
- **NGN Wallet** — the User's Naira balance, displayed as e.g. ₦348,200.00. Funds from completed Trades land here.
- **Crypto Holding** — a balance of one crypto **Asset** (BTC or USDT), with its own receiving **Address**. Balances are decimal strings (e.g. "0.0048"), never floats.
- **Balance Visibility** — a per-user toggle that masks displayed balances behind the eye icon.

## Trading

- **Gift Card Brand** — a tradable card type (e.g. Apple Gift Card), with a category and tradable value range.
- **Rate** — how many Naira one US dollar of a given Brand is worth right now (`ratePerDollar`).
- **Trade** — the act of selling a gift card to Daniruk: pick a Brand, enter card details, accept a Quote, receive a Payout.
- **Quote** — the computed Payout for a proposed Trade: card value in USD × Rate, shown before the User commits.
- **Payout** — the NGN amount credited to the NGN Wallet when a Trade completes.

## Payments & Services

- **Service** — an everyday bill payment offered by Daniruk: Airtime, Data, Electricity, or Flights.
- **Plan** — a purchasable option within a Service (data bundle, electricity disco, mobile network).
- **Bank Account** — a saved withdrawal destination: bank name, 10-digit account number, resolved account name.
- **Withdrawal** — moving money out: NGN to a Bank Account, or crypto to an external Address.
- **Receive** — moving money in: displaying the User's crypto Address for an incoming transfer.

## Records

- **Transaction** — a ledger entry for any money movement: Trade, Service payment, Receive, or Withdrawal. Always has an amount, a status, and a Reference.
- **Reference** — a Transaction's human-readable identifier (e.g. DNR-284910).
- **Status** — a Transaction's lifecycle state: `successful`, `pending`, or `failed`.

## Growth & Trust

- **Referral** — an invitation to Daniruk via the User's personal code; earns the User NGN when invitees join.
- **Daniruk Secure** — the brand's trust mark: "every transaction is monitored around the clock."
- **Notification** — an in-app message to the User, with read/unread state.
