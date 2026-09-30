# PharmaTrace — rules.md
Hard constraints for the coding agent. These override convenience or shortcuts. If a request from the user conflicts with a rule here, flag the conflict instead of silently violating it.

## 1. Build Order (do not skip ahead)
Follow the PRD's Recommended Implementation Order (Appendix D):
1. Monorepo scaffold + DB schema + auth/RBAC
2. Smart contract + Hardhat tests, deployed locally
3. Backend blockchain integration (register/transfer/confirm)
4. QR generation/verification
5. Frontend core happy-path (Manufacturer → Consumer)
6. Security hardening pass
7. AI risk engine
8. Remaining role dashboards + polish
9. Full test suite
10. Amoy testnet deployment + smoke test

**Build and validate one phase before starting the next.** Do not generate the entire codebase in one shot — this produces unreviewable, likely-broken output. After each phase, run/describe how to verify it before moving on.

## 2. Non-Negotiable Security Rules
- Backend must **re-validate every authorization check** — never trust a role claim from the frontend.
- Smart contract functions that change state must carry `onlyRole`/`onlyCurrentCustodian` modifiers — the contract is the final backstop even if the backend were bypassed.
- No private key, RPC secret, JWT secret, or QR signing secret may ever appear in frontend code, git history, or logs. All secrets come from environment variables per `.env.example`.
- Passwords are always hashed (bcrypt/argon2) — never stored or logged in plaintext.
- All user input is validated server-side (schema validation) regardless of any client-side validation already present.
- Rate-limit the public verification endpoint and the login endpoint.
- Every state-changing action writes an `audit_logs` row (actor, action, entity, timestamp, tx hash if applicable).

## 3. Blockchain Rules
- A DB row representing an on-chain fact is `PENDING` until a transaction receipt confirms it, and `FAILED` if the transaction reverts. Never mark something "confirmed" without an actual receipt.
- Only `blockchainService` may import Ethers.js or hold the contract ABI/address — no other module talks to the chain directly.
- Do not add on-chain storage for high-frequency or high-volume data (scan logs, risk scores, PII) — see `architecture.md` §5 for the on-chain/off-chain split. Ask before changing that split.
- The contract is explicitly **non-upgradeable** for the MVP — do not introduce a proxy pattern.

## 4. AI/Risk Rules
- Deterministic rules (recall, expiry, hash mismatch, unauthorized custodian, duplicate-scan pattern) are **always authoritative**. The AI risk score is advisory only and must never suppress, hide, or override a deterministic `RECALLED`/`EXPIRED`/`INVALID_QR`/`UNAUTHORIZED_TRANSFER` result.
- Any UI surface showing a risk score must display the disclaimer text verbatim from `design.md` §2.
- Do not claim, in code comments, UI copy, or docs, that the system "proves" a medicine is counterfeit or authentic in a physical sense — it verifies the digital record only.

## 5. Data Integrity Rules
- Enforce uniqueness at the database level (not just application level) for batch numbers, licenses, wallet addresses, QR IDs — per `architecture.md` §6.
- Product-level medicine data must not be duplicated per batch; batches reference a shared `medicines` row.
- Never fabricate statistics, benchmarks, or success numbers in generated copy, comments, or seed data descriptions — use clearly-labeled sample/demo data only.

## 6. Coding Conventions
- TypeScript throughout backend and frontend.
- Follow the layering in `architecture.md` §4 strictly: controllers thin, services hold logic, models are the only Prisma access point.
- Every new API endpoint must match a definition in the PRD's API Specification (§20) — if a needed endpoint isn't documented there, add it to the PRD/architecture doc rather than inventing undocumented behavior silently.
- Every new mutating endpoint needs: input validation, an authorization check, and (if it changes trust-relevant state) an audit-log write.
- Write or update a test (unit, integration, or contract test as appropriate) alongside any new business logic — don't defer all testing to Phase 9.

## 7. Scope Discipline
- Stay inside MVP Scope (PRD §33) unless explicitly asked to build a Future Scope (§34) item.
- If time-constrained, prefer the fallbacks listed in the PRD's "Features That Can Be Simplified If Time Runs Out" (Appendix C) over silently dropping a Critical feature (Appendix B).
- Never remove or weaken a Critical Feature (PRD Appendix B) to save time without flagging it to the user first.

## 8. When Unsure
If a requirement is ambiguous or a design decision isn't covered in `PharmaTrace_PRD.md`, `architecture.md`, or `design.md`, stop and ask rather than inventing a new pattern that conflicts with the existing architecture.
