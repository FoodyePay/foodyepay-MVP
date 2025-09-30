# Coinbase Onramp Security Hardening

Date: 2025-09-30

This document tracks the mandatory security changes requested by Coinbase (CORS lockdown + client IP forwarding).

## 1. CORS Origin Allowlist
- Environment variable: `ONRAMP_ALLOWED_ORIGINS`
- Format: comma / space / newline separated list of exact origins, e.g.
```
ONRAMP_ALLOWED_ORIGINS="https://foodyepay.com https://app.foodyepay.com"
```
- Behavior:
  * If the incoming request has an `Origin` header that is NOT in the allowlist -> 403 (no CORS headers returned)
  * If there is no `Origin` header (native mobile, curl) -> treated as allowed but **no** `Access-Control-Allow-Origin` header is added (prevents wildcard leakage)
  * If allowlist is empty -> all browser origins are effectively blocked
- Preflight: `OPTIONS /api/coinbase-session-token` responds 204 with CORS headers only when origin is allowed.

## 2. Client IP Verification
- The backend extracts IP using the following precedence:
  1. `x-forwarded-for` (first entry)
  2. `x-real-ip`
- Added to the token creation payload as `clientIp` when present.
- If absent (local dev) the field is omitted.

## 3. Implementation Files
- Route: `app/api/coinbase-session-token/route.ts`
- Helper logic: inlined at top (CORS + IP extraction)
- Env check script updated: `scripts/env-check.js` now reports presence + entry count.

## 4. Deployment Steps
1. Set `ONRAMP_ALLOWED_ORIGINS` in production environment (DO NOT commit to git).
2. Redeploy application.
3. Verify:
   - Allowed origin: `fetch('/api/coinbase-session-token', ...)` returns 200 with `Access-Control-Allow-Origin` echoing the origin.
   - Disallowed origin: 403.
   - Native/mobile (no Origin): succeeds without `Access-Control-Allow-Origin` header.
4. Check `/api/coinbase-session-token?diag=1` (GET) still works (does not expose extra headers).

## 5. Monitoring & Alerts
- Log 403 counts (future: add structured logging).
- If sudden spike in disallowed origins -> possible abuse attempt.

## 6. Future Hardening Ideas
- Rate limiting per IP + wallet address.
- Signed nonce challenge to bind wallet session to IP (optional; evaluate UX impact).
- Add `User-Agent` heuristics filtering for obvious bots.

Status: IMPLEMENTED (pending production redeploy with populated `ONRAMP_ALLOWED_ORIGINS`).
