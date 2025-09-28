# FoodyePay dApp Mobile Store Readiness Checklist

This checklist helps prepare FoodyePay for submission to Google Play and Apple App Store using a WebView (wrapper) or future React Native build.

## 1. Technical Packaging Strategy
- [ ] Decide wrapper: Capacitor (recommended) OR Expo/React Native port
- [ ] Configure custom scheme: `foodyepay://` for OAuth redirects (NextAuth)
- [ ] Deep link mapping (Android `assetlinks.json`, iOS Associated Domains `applinks:foodyepay.com`)
- [ ] Splash screen & app icons (all resolutions) generated and stored in `mobile/` assets
- [ ] Offline / PWA manifest validated (add manifest if not present)

## 2. Security & Secrets
- [ ] Remove ALL private keys from `.env.local` before bundling mobile build
- [ ] Use server-only endpoints for Coinbase Onramp JWT creation (`/api/coinbase-session-token`)
- [ ] Introduce runtime config endpoint (done: `/api/cdp-env`) for diagnostics without leaking secrets
- [ ] Rotate any secrets already committed publicly (Coinbase, Supabase service key, wallet private keys, Gmail app password, Twilio, Google Maps). Update in deployment platform only.
- [ ] Implement server rate limiting for verification endpoints (phone/email)

## 3. Compliance (Crypto / Financial)
- [ ] Add disclaimer screen (Not an exchange / educational purpose / risk notice)
- [ ] KYC/AML: Document flow (currently none – onramp handled by Coinbase)
- [ ] Terms of Service & Privacy Policy links visible (footer + drawer menu)
- [ ] Apple: Avoid referencing “investment”, focus on “utility/rewards/payment”
- [ ] Google: Declare blockchain features in Play Console content questionnaire

## 4. Content & UX
- [ ] Localize key strings (EN + ZH initial) via simple i18n layer (future)
- [ ] Provide fallback UI when network offline (basic offline notice)
- [ ] Accessibility: Contrast checks (dark theme ok), add alt text for icons/images
- [ ] Remove test/debug pages from production build (`/test-*`, `/api/test-*`)
- [ ] Hide developer diagnostics in production (feature flags)

## 5. Privacy & Data Handling
- [ ] Document data collected: email, phone (hashed?), wallet address, restaurant metadata
- [ ] Provide user deletion request workflow (support email + API placeholder)
- [ ] Avoid storing raw phone verification codes (Twilio handles codes externally)
- [ ] Ensure Supabase RLS policies enforced for restaurant/user tables

## 6. Performance & Stability
- [ ] Lighthouse performance > 70 mobile initial target
- [ ] Image optimization: replace `<img>` with `next/image` (WalletQRCode.tsx etc.)
- [ ] Bundle analysis: Ensure no private libs leak to client (check tree shaking)
- [ ] Error boundary for critical components (Onramp, Swap, Rewards)

## 7. Push Notifications (Optional Later)
- [ ] Decide provider (FCM + APNS via OneSignal or Firebase)
- [ ] Abstract notification client so web remains functional without

## 8. Analytics & Monitoring
- [ ] Add basic event logging (page views, onramp start/success)
- [ ] Backend error logging (Supabase or self-hosted Sentry)
- [ ] Health endpoints: `/api/cdp-env`, `/api/coinbase-session-token?diag=1`

## 9. QA Test Matrix
| Area | Scenario | Status |
|------|----------|--------|
| Onramp | Successful session token fetch |  |
| Onramp | Missing env -> graceful error |  |
| Registration | Google Maps search normal |  |
| Registration | Phone verify success |  |
| Registration | Phone verify failure (bad code) |  |
| Rewards | Claim initial reward |  |
| Swap | Insufficient balance error |  |
| Offline | WebView offline state |  |
| Deep Link | OAuth callback handled |  |

## 10. Store Listing Assets
- [ ] App name: FoodyePay
- [ ] Subtitle / Short description
- [ ] Long description explaining utility points not speculative value
- [ ] 5–8 screenshots (registration, dashboard, onramp, rewards, scan to pay)
- [ ] Feature graphic (Google Play)
- [ ] App icon 1024x1024 (mask-safe)
- [ ] Privacy Policy URL (e.g. https://foodyepay.com/privacy)
- [ ] Support URL / Email (support@foodyepay.com)

## 11. Risk Remediation
- Private keys in `.env.local`: MUST rotate – do not bundle in mobile
- Supabase service role key exposed: rotate and move to server-only secret store
- Gmail app password exposed: rotate & store securely; consider switching to Resend
- Wallet private keys exposed: assume compromised – generate new distribution / swap keys

## 12. Deployment Steps (Wrapper Example with Capacitor)
1. `npx create-capacitor-plugin mobile-wrapper` (or initialize capacitor in repo)
2. Add `capacitor.config.ts` with `server.url` pointing to deployed web app for initial version
3. Add splash + icon resources via `npx @capacitor/assets generate`.
4. Implement deep link handling (Android intent filters / iOS Associated Domains)
5. Build web: `NEXT_PUBLIC_APP_URL=https://foodyepay.com npm run build` then copy `.next` to hosting (Vercel/Netlify)
6. Run `npx cap sync` then open Xcode / Android Studio
7. Test WebView performance, adjust `allowNavigation` and CSP if needed

## 13. Future Native Enhancements
- Native camera module for faster QR scanning
- Secure enclave key storage for signing (if moving wallet client-side)
- Push notifications for reward events

---
Status: INITIAL CHECKLIST CREATED (update as you address each item).
