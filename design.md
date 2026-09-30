# PharmaTrace — design.md
Agent context file for UI/UX. Defines pages, components, visual language, and per-role screens. Pair with `architecture.md` (data/API) and `rules.md` (constraints).

## 1. Visual Language
- Clean, clinical, trustworthy — not playful. Whites/light grays, one confident primary color (e.g. deep teal or blue), status colors reserved *only* for verification/status badges:
  - Green = `VERIFIED_AUTHENTIC`
  - Amber = `VERIFIED_BUT_FLAGGED` / `SUSPICIOUS_DUPLICATE` / risk Medium
  - Red = `RECALLED` / `INVALID_QR` / `UNAUTHORIZED_TRANSFER` / risk High
  - Gray = `EXPIRED` / `UNKNOWN_PRODUCT` / `VERIFICATION_FAILED`
- Typography: one sans-serif family, clear hierarchy (page title / section header / body / label).
- Every status badge must show a short plain-language explanation next to it, not just a colored pill — this is a trust product, ambiguity undermines the point.
- Data-dense role dashboards (Admin/Inspector) can use tables + filters; the public verification result page must be simple enough for a non-technical consumer to read on a phone in a pharmacy aisle.

## 2. Public Pages (no auth)
- **Landing Page:** what PharmaTrace is, "Scan to Verify" CTA, how-it-works summary.
- **Verify / QR Scanner Page:** camera scanner (`html5-qrcode`) + manual code entry fallback. Rate-limited on the backend.
- **Verification Result Page:** big status badge (§1 colors) + plain-language message, batch basics (name, expiry, manufacturer), custody-chain summary (simplified — not full internal detail), and (if flagged/suspicious) a short explanation of what was detected. Must show the AI-risk disclaimer text whenever a risk score is displayed: *"Risk Score is an AI-generated advisory indicator based on behavioral patterns. It is not proof that a medicine is physically counterfeit."*
- **About / How It Works:** explains blockchain's actual role honestly (tamper-evident custody + hash anchoring — not physical inspection).

## 3. Auth Pages
- Login (email/password).
- Registration (role-specific form: org name, license number, contact info — submits to `PENDING` approval queue).
- Forgot Password.
- Post-registration "pending approval" screen for business roles.

## 4. Manufacturer
- **Dashboard:** KPIs (batches created, active, distributed, flagged) + recent activity.
- **Create Medicine Batch:** form per PRD §7 fields; on submit show a progress state (`Saving → Submitting to blockchain → Confirmed`) reflecting the real tx lifecycle — never a fake instant "success."
- **Batch Details:** full batch record + custody timeline + tx hash (linked to block explorer) + QR image (downloadable/printable).
- **Generate QR:** re-render/download QR for a batch or package.
- **Inventory / Supply-chain history:** table, filterable by status.

## 5. Distributor / Wholesaler
- **Dashboard:** incoming shipments count, current inventory.
- **Incoming Shipments:** list with a "Confirm Receipt" action.
- **Transfer Medicine:** select batch + recipient (only valid next-stage roles selectable) + submit.
- **History:** past transfers in/out.

## 6. Pharmacy
- **Dashboard:** received medicines, verified count, suspicious scans, recalled/expiring items.
- **Receive Medicine / Verify Medicine / Scan QR:** same scanner component as the public page, but pharmacy view shows full internal detail (custodian chain, batch data) rather than the simplified consumer view.
- **Inventory:** table with expiry highlighting.
- **Flag Medicine:** reason-required action, confirmation modal.
- **Recall Notifications:** banner/list of affected batches this pharmacy has held.

## 7. Admin
- **Dashboard:** platform-wide KPIs (PRD §"Admin" KPI list).
- **User Management / Manufacturer Management:** approval queue with approve/reject actions.
- **Supply Chain Monitoring:** live table of in-transit batches.
- **Blockchain Transactions:** raw list of on-chain events with explorer links (this is the judge-verifiability screen — make it prominent and legible).
- **Suspicious Activity / AI Risk Dashboard:** risk-score distribution, flagged batches, security events feed with severity color-coding (§1).
- **Audit Logs:** searchable/filterable table (actor, action, entity, timestamp, tx hash).
- **Recall Management:** initiate/view recalls, see cascading notification status.

## 8. Inspector
- **Dashboard / Search Medicine:** search by batch/product/manufacturer.
- **Verify Chain of Custody:** full timeline viewer, read-only.
- **Audit Trail / Suspicious Activity:** same data as Admin's views, read-only, no write actions rendered at all (not just disabled).

## 9. Shared Components
`StatusBadge` (maps state → color + label per §1), `CustodyTimeline` (vertical stepper: Manufacturer → Distributor → Wholesaler → Pharmacy → Consumer, with timestamps and tx-hash links), `QRScanner`, `RiskScoreGauge` (0–100, banded per PRD §19, always paired with the disclaimer text), `RoleGuardedRoute` (client-side route guard — UX only, not a security boundary), `TxStatusToast` (Pending/Confirmed/Failed for blockchain writes).

## 10. Error & Empty States
Every list view needs an explicit empty state (not a blank screen). Every blockchain-dependent action needs a visible pending/confirmed/failed state — never silently succeed before the chain confirms. Verification result page must handle all 9 states in §"Verification State Machine" of `architecture.md` with distinct, unambiguous copy for each.
