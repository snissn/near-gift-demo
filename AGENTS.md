# Defuse Frontend – Slimmed Learning Edition (Agent Plan)

## Objectives

- Remove the Trade tab and related pages by deleting the swap/OTC code from the repository (not just hiding UI).
- Keep Account, Deposit, Withdraw, and Gift flows intact and usable.
- Reduce supported assets to NEAR and ZEC only by deleting other token definitions and chain-specific logic.
- Remove non‑NEAR chain code paths, providers, and UI where feasible (EVM, Solana, Ton, Stellar, Tron) to minimize boilerplate.
- Ship a smaller, easier‑to‑learn codebase with clear next steps.

## Repo Recon (what matters for this effort)

- Routing (Next.js App Router):
  - Trade/Swap: `src/app/(home)` (root `/` renders `SwapWidget`).
  - OTC: `src/app/otc/*` (part of “Trade” surface).
  - Account: `src/app/account/*` → `AccountWidget`.
  - Deposit: `src/app/deposit/*` → `DepositWidget`.
  - Withdraw: `src/app/withdraw/*` → `WithdrawWidget`.
  - Gift: `src/app/gift-card/*`.
- Navigation:
  - Desktop: `src/components/Navbar/NavbarDesktop.tsx` (Account, Trade, Deposit button).
  - Mobile: `src/components/Navbar/NavbarMobile.tsx` (Account, Trade, Deposit).
- Tokens:
  - `src/constants/tokens.ts` (LIST_TOKENS). Contains many chains and assets.
- Wallet/Chains:
  - `src/hooks/useConnectWallet.ts` supports Near, EVM, Solana, Ton, Stellar, Tron, WebAuthn.
  - Wallet UI: `src/components/Wallet/*` lists multiple chains.
- SDK Features (we’ll keep): `AccountWidget`, `DepositWidget`, `WithdrawWidget`, Gift.

## Strategy (hard deletions first)

Phase 1 – Hard remove trading and extra chains:
1) Delete Trade UI and routes: remove `src/app/(home)` (Swap) and `src/app/otc/*` (OTC); remove corresponding SDK features: `src/components/DefuseSDK/features/swap` and `src/components/DefuseSDK/features/otcDesk`.
2) Remove Trade nav from desktop/mobile and add a redirect from `/` → `/account` to preserve entry point.
3) Prune tokens to NEAR + ZEC only in `src/constants/tokens.ts` (delete other tokens and their grouped chain entries).
4) Remove non‑NEAR chain wallet UI and providers: adjust `src/components/Wallet/*` to only surface Near (optionally WebAuthn if needed for learning) and delete providers for Solana, EVM, Ton, Stellar, Tron if not used elsewhere.
5) Keep Deposit/Withdraw/Account/Gift features but ensure they only reference remaining chains; delete dead code paths within these features when safe.

Phase 2 – Cleanup and dependency slimming:
6) Rip out unused services, hooks, and utilities tied exclusively to removed chains (e.g., TON jetton, Solana balance services, Tron/Stellar handlers). Retain shared utils.
7) Update `package.json` to remove unused chain SDKs/adapters; run typecheck/build and fix import fallout.
8) Update docs to reflect the learning edition scope and supported features.

## Detailed Changes

- Navigation
  - Desktop: Delete Trade nav item; keep Account + Deposit CTA.
  - Mobile: Remove Trade icon; keep Account + Deposit.
  - Routes: Add a simple redirect from `/` → `/account` and delete swap/OTC pages.

- Tokens
  - Replace `LIST_TOKENS` with only NEAR (wrap.near) and ZEC (zcash + near representation). Delete other token entries to reduce footprint.
  - Ensure `useTokenList` and token sorting still operate with a tiny list.

- Wallet & Chains
  - Update `WalletConnections` to only display Near (and optionally WebAuthn if required for learning demos).
  - Remove unused providers and hooks for EVM/Solana/Ton/Stellar/Tron if not referenced by kept features.

- Routes/Features
  - Delete `src/app/(home)` and `src/app/otc/*` immediately (redirect ensures UX continuity).
  - Remove `src/components/DefuseSDK/features/swap` and `src/components/DefuseSDK/features/otcDesk`.
  - Re-run type checks and fix imports referencing removed modules.

## Risks / Considerations

- Deposit/Withdraw components accept multi‑chain transaction handlers; we’ll continue to pass the Near handlers and keep others wired but unused in Phase 1 to avoid API changes. In Phase 2 we can make these props optional and remove unused paths.
- ZEC flows rely on token definitions that include both zcash native and NEAR representations; we’ll retain only what is needed for current flows.
- Hard deletions will cause type/import fallout; address iteratively with builds and targeted fixes.

## TODOs (live checklist)

- [ ] Delete `(home)` swap routes and `otc/*` routes.
- [ ] Remove Trade from desktop/mobile nav.
- [ ] Redirect `/` → `/account`.
- [ ] Prune `LIST_TOKENS` to NEAR + ZEC only (delete others).
- [ ] Update `WalletConnections` to show only Near (optionally WebAuthn).
- [ ] Delete providers/hooks strictly for EVM/Solana/Ton/Stellar/Tron if unused by kept features.
- [ ] Remove SDK features: delete `features/swap` and `features/otcDesk`.
- [ ] Clean imports/types; run typecheck and fix fallout.
- [ ] Verify Account, Deposit, Withdraw, Gift with NEAR/ZEC.
- [ ] Remove unused deps from `package.json`; build and smoke test.
- [ ] Update README/docs for learning edition scope.

## Milestones

M1: Trading removed from filesystem; `/` redirects to `/account`; tokens pruned to NEAR/ZEC; wallet UI reduced to Near; core flows smoke tested.
M2: Unused providers/services removed; dependencies trimmed; build clean; docs updated.
