# Onramp Deployment Checklist

Purpose: Ensure production deployment always has correct Coinbase Onramp security (CORS + clientIp) and avoids 403 / upstream 502 issues.

## 1. Environment Variables (Production)
Set / verify:
```
ONRAMP_ALLOWED_ORIGINS=https://foodyepay.com,https://www.foodyepay.com
CDP_API_KEY_ID=<uuid-from-coinbase-portal>
CDP_API_PRIVATE_KEY=<base64 ed25519 secret, one line>
CDP_PROJECT_ID=<matching project uuid>
NEXT_PUBLIC_COINBASE_PROJECT_ID=<same as CDP_PROJECT_ID>
NEXT_PUBLIC_COINBASE_APP_ID=<same as project id if required by frontend>
NEXT_PUBLIC_APP_URL=https://foodyepay.com
```
Optional / dev only:
```
ONRAMP_ALLOWED_ORIGINS=http://localhost:3000,https://foodyepay.com,https://www.foodyepay.com
```

Consistency rules:
- PROJECT_ID / APP_ID / public project id must all match (no mixing 86d5... vs 87b0...).
- Private key must NOT contain PEM headers; keep base64 only (length usually 88 chars for seed+pub combined).

## 2. Code Version Confirmation
After deploy run:
```
GET https://foodyepay.com/api/coinbase-session-token?diag=1
```
Expect JSON with fields:
```
codeVersion: "2025-09-30-v3" (or later)
keyDiagnostics.{ isBase64: true }
cors.sampleCheck.wwwAllowed: true
```
If codeVersion missing => wrong (old) build deployed.

## 3. CORS Verification
From browser console at https://www.foodyepay.com :
```js
fetch("/api/coinbase-session-token?diag=1").then(r=>r.json()).then(console.log)
```
Ensure:
- No 403
- `cors.sampleCheck.wwwAllowed === true`

## 4. Token Endpoint Functional Test
PowerShell example:
```powershell
Invoke-WebRequest -Method Post `
  -Uri "https://foodyepay.com/api/coinbase-session-token?debug=1" `
  -Headers @{ "Content-Type"="application/json"; "Origin"="https://www.foodyepay.com" } `
  -Body '{"address":"0xYourUserWalletAddress"}' -UseBasicParsing | Select -Expand Content
```
Expected outcomes:
- 200: Contains token + onrampUrl (success)
- 502: Upstream Coinbase error -> capture JSON (likely project/key mismatch) and investigate
- 403: CORS misconfiguration -> re-check step 1

## 5. Common Failure Patterns
| Symptom | Likely Cause | Fix |
|--------|--------------|-----|
| 403 Origin not allowed | Missing www domain in allowlist or old code | Update env + redeploy, confirm diag |
| 502 Failed to create session token | Project ID / key mismatch or Coinbase gating | Verify IDs unify, confirm approval |
| 500 Invalid JSON body | Client POST quoting issue | Use single-quoted JSON in PowerShell |
| codeVersion missing | Old lambda/function still active | Force redeploy / clear cache |

## 6. Coinbase Evidence Capture
For support/email:
1. Curl command with `-v` showing `Origin` header.
2. Diag JSON snippet showing `codeVersion`, `cors.sampleCheck`.
3. 200 success or 502 payload JSON.
4. Timestamp + request IP (hashed optional later).

## 7. Rotation / Security Hardening (Next Iteration)
- Add rate limiting (per IP + per wallet) to token route.
- Log hashed (SHA256) clientIp + requestId.
- SECURITY.md summarizing implemented controls.
- Optional: staging domain (e.g. https://staging.foodyepay.com) added to allowlist.

## 8. Rollback Plan
If new deployment breaks Onramp:
1. Revert to previous commit (Git) and redeploy.
2. Keep `ONRAMP_ALLOWED_ORIGINS` unchanged.
3. Run diag to confirm older codeVersion (temporarily) acceptable.

## 9. Quick Yes/No Gate Before Launch
- [ ] codeVersion present & correct
- [ ] cors.sampleCheck.wwwAllowed true
- [ ] POST returns 200 or known upstream 502 (not 403)
- [ ] IDs unified (only one UUID family appears)
- [ ] Evidence captured for Coinbase if needed

---
Maintainer: Update CODE_VERSION constant in `app/api/coinbase-session-token/route.ts` whenever behavior changes.
