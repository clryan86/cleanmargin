# CleanMargin
A focused margin-review app for independent commercial cleaning companies.

## What works
- Fictional sample workspace for immediate exploration.
- Private workspaces persisted in Cloudflare D1.
- Contracts, scope, review dates, and margin targets.
- Monthly cost snapshots that preserve historical assumptions.
- Contribution dashboard, missing-cost states, filters, and search.
- Validated CSV import with a preview before replacement.
- Repricing scenarios, client discussion drafts, printable reports, CSV and JSON exports.
- Account isolation, server validation, request limits, origin checks, and optimistic concurrency.
- Read-only WebMCP access to the visible contract-health results.

**Billing is not active.** The $49/month plan is a commercial hypothesis. This is a working private pilot, not a publicly launched payment-enabled SaaS. No customers, revenue, savings, or competitive superiority are claimed.

## Run locally
Node.js 22.13+ required; Node 24 recommended for built-in SQLite.

```sh
npm ci
npm run build
npm run dev
```

Open the printed loopback URL. Local sign-in uses a development-only identity. Records are saved in ignored .sites-runtime/local.sqlite. That identity adapter is excluded from the production Worker.

```sh
npm run typecheck
npm test
npm run db:generate
npm run build
```

Run db:generate only after editing db/schema.ts. The initial migration is checked in. The local server applies new migrations on startup. Append migrations rather than editing applied ones.

## Architecture
React + TypeScript client, an ESM Cloudflare Worker, D1 storage, and Drizzle migrations. The build embeds compiled JavaScript, CSS, and the favicon into the Worker. esbuild-wasm avoids native compiler assumptions across Windows, macOS, and Linux.

- app/: working interface
- components/product/: dialogs, forms, importer, calculator
- lib/: math, validation, CSV, report generation
- server/worker.ts: authenticated API and static routes
- db/ and drizzle/: schema and generated migrations
- scripts/: build, local preview, tests, migration generation

## Hosting and authentication
The registered deployment uses OpenAI Sites and its trusted identity headers. Keep the production Worker behind the Sites dispatcher. Never expose it directly on an untrusted origin and assume client-supplied identity headers are secure. Another host requires a real authentication adapter.

.openai/hosting.json contains the owner's Site binding, not a credential. Forks must replace it with their own Site identity. The build emits dist/server/index.js and dist/.openai/ migration metadata. Publish through the Sites workflow. Never commit tokens or runtime data.

## Calculation definition
Loaded labor = actual paid hours × wage × (1 + payroll burden / 100).
Contribution = entered revenue − labor − supplies/equipment − allocated overhead.
Margin = contribution / revenue; zero revenue has no defined margin.
Target monthly price = costs / (1 − target margin), rounded up to cents.

This is a management estimate, not guaranteed net profit. Use complete monthly costs, include owner labor, and avoid double-counting overhead. Pricing changes require client agreement.

## Business documents
- [Business case and competitor research](docs/BUSINESS-CASE.md)
- [Founder-led launch plan](docs/LAUNCH.md)
- [Halal operating policy](docs/HALAL-POLICY.md)
- [Validation and launch limits](docs/VALIDATION.md)

## Before accepting payments
Configure and test a real payment provider, recurring billing consent, cancellation, refunds, and entitlements. Add the operator's service/privacy terms and contact details. Verify external-customer sign-in, backups, and production access controls. Complete an independent security review. Keep the preview private until those launch requirements are met.

Public source is not a license to use this deployment or its data. No open-source license has been assigned by the owner.
