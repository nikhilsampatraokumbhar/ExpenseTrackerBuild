# Trackk — Project TODO

> Last updated: 2026-03-10

---

## Completed

### Core Features
- [x] SMS auto-detection for 20+ Indian banks (SBI, HDFC, ICICI, Axis, Kotak, Paytm, GPay, etc.)
- [x] Transaction parsing (amount, merchant, bank, type)
- [x] Personal expense tracking with categories and tags
- [x] Group expense splitting with debt calculation
- [x] Settlement tracking and reimbursement screen
- [x] Savings goals with streak tiers and carry-forward leftovers
- [x] Budget management (overall + per-category)
- [x] Insights & analytics (spending by category, trends)
- [x] Receipt upload for transactions
- [x] Deep link support (referral invites, app links)

### Premium & Monetization
- [x] 5 individual plans (Free, Monthly, Half-Yearly, Annual, Lifetime)
- [x] 2 family plans (Monthly, Annual) with up to 4 members
- [x] Founding member pricing
- [x] Promo code system (client-side: LAUNCH50, FOUNDING)
- [x] Referral system (share code, earn 1 month free per referral, up to 12 months)
- [x] Pricing screen with plan comparison

### Auth & Cloud
- [x] Firebase Auth (phone OTP login)
- [x] Firestore cloud sync for groups
- [x] AsyncStorage local-first data storage
- [x] Context API state management (Auth, Group, Tracker, Premium)

### Backend (Firebase Cloud Functions)
- [x] `createOrder` — Razorpay order creation (server-side key security)
- [x] `verifyPayment` — HMAC-SHA256 signature verification + subscription activation
- [x] `validateSubscription` — Subscription status & expiry checking
- [x] `redeemPromoCode` — Server-side promo code validation
- [x] Firestore security rules (membership checks, server-only writes for subscriptions)

### Email-Based Transaction Detection (Cloud Functions)
- [x] `connectEmail` — OAuth2 exchange for Gmail/Outlook/Yahoo + webhook setup
- [x] `disconnectEmail` — Remove email connection and cleanup
- [x] `gmailWebhook` — Pub/Sub handler for real-time Gmail push notifications
- [x] `outlookWebhook` — HTTP handler for Microsoft Graph webhooks
- [x] `renewEmailWatches` — Scheduled daily renewal of Gmail/Outlook subscriptions
- [x] `pollYahooEmails` — Scheduled polling every 5 minutes for Yahoo Mail
- [x] Email transaction parser (35+ Indian bank/UPI email senders)
- [x] FCM notification sender for email-detected transactions (Android + iOS)

### Quality & Performance
- [x] Security audit fixes (removed key_secret from client, __DEV__ flag for dev promos)
- [x] Performance optimizations (useMemo on all context providers, React.memo on TransactionCard)
- [x] Accessibility fixes (WCAG AA color contrast, 44px touch targets, loading states)
- [x] babel-plugin-transform-remove-console for production builds
- [x] 116 unit/integration tests passing (6 test suites)
- [x] SMS notification deduplication

### Build & CI
- [x] EAS Build configuration
- [x] GitHub Actions APK build workflow (release APK)
- [x] Firebase project configuration (.firebaserc, firebase.json)
- [x] Fixed `babel-preset-expo` version to `~55.0.0` (was ~13.0.0, caused codegen failures)
- [x] Fixed `react-native-screens` to `~4.23.0` and `react-native-safe-area-context` to `~5.6.2` (Expo 55 compat)
- [x] Fixed `settings.gradle` project name (ExpenseTrackerBuild → Trackk)
- [x] Added `googleServicesFile` to `app.json` for prebuild
- [x] Copied `google-services.json` to project root

---

## Pending — Pre-Launch

### Payment Integration (Priority 1)
- [ ] Set up Firebase Blaze plan (required for Cloud Functions)
- [ ] Install Firebase CLI (`npm install -g firebase-tools`)
- [ ] Set Razorpay secrets:
  ```
  firebase functions:secrets:set RAZORPAY_KEY_ID
  firebase functions:secrets:set RAZORPAY_KEY_SECRET
  ```
- [ ] Deploy Cloud Functions: `cd functions && npm install && cd .. && firebase deploy --only functions`
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Flip `USE_PRODUCTION_PAYMENT` to `true` in `src/services/PaymentService.ts`
- [ ] End-to-end test: payment → verification → subscription activation

### Email OAuth Setup (Priority 1)
- [ ] Create Google Cloud OAuth 2.0 credentials (Gmail API)
- [ ] Register Azure AD app (Microsoft Graph API for Outlook)
- [ ] Register Yahoo Developer app (Yahoo Mail API)
- [ ] Set email OAuth secrets:
  ```
  firebase functions:secrets:set GMAIL_CLIENT_ID
  firebase functions:secrets:set GMAIL_CLIENT_SECRET
  firebase functions:secrets:set MICROSOFT_CLIENT_ID
  firebase functions:secrets:set MICROSOFT_CLIENT_SECRET
  firebase functions:secrets:set YAHOO_CLIENT_ID
  firebase functions:secrets:set YAHOO_CLIENT_SECRET
  ```
- [ ] Create Pub/Sub topic for Gmail push notifications
- [ ] Add "Connect Email" UI to Android app
- [ ] Register FCM device tokens on client side
- [ ] End-to-end test: email → parse → FCM notification → add to tracker

### Promo Codes (Priority 1)
- [ ] Add promo codes to Firestore `promoCodes` collection for server-side validation
- [ ] **REMOVE `NKTEST2026` test promo code before public launch** (`src/store/PremiumContext.tsx:138`)

### Testing (Priority 2)
- [ ] Build release APK and test with `NKTEST2026` promo code
- [ ] Test all premium features in release build
- [ ] Test payment flow end-to-end (after Razorpay setup)
- [ ] Test group sync across multiple devices
- [ ] Test SMS parsing with real bank messages on release APK
- [ ] Edge case testing (network failures, expired subscriptions, invalid promo codes)

### Polish (Priority 3)
- [ ] App icon and splash screen finalization
- [ ] Play Store listing assets (screenshots, description, feature graphic)
- [ ] Privacy policy and terms of service pages
- [ ] Rate/review prompt after positive usage milestones

---

## Backlog — Post-Launch

### Features
- [ ] Export transactions to CSV/PDF
- [ ] Recurring expense tracking
- [ ] Multi-currency support
- [ ] Dark/light theme toggle
- [ ] Widgets (daily spend, budget remaining)
- [ ] iOS app (email-only detection, no SMS — Cloud Functions already built)
- [ ] Inbound email parsing for non-Gmail/Outlook/Yahoo providers (SendGrid/Mailgun)

### Technical Debt
- [ ] Migrate from AsyncStorage to MMKV for faster local storage
- [ ] Add E2E tests (Detox or Maestro)
- [ ] Add Crashlytics / Sentry for error monitoring
- [ ] Server-side analytics (usage metrics, funnel tracking)
- [ ] CI pipeline for automated testing on PR

---

## Architecture Notes

- **Local-first**: Personal expenses stored in AsyncStorage, groups synced via Firestore
- **Payment security**: Razorpay key_secret never on client; all payment verification server-side via Cloud Functions
- **Dev vs Prod**: `USE_PRODUCTION_PAYMENT` flag in PaymentService.ts; dev promo codes behind `__DEV__`
- **State management**: Context API + useMemo optimization (no Redux needed at current scale)
- **Dual detection**: Android uses SMS (primary) + email parsing; iOS uses email parsing only
- **Email providers**: Gmail (Pub/Sub push), Outlook (Graph API webhook), Yahoo (5-min polling)
- **Email use cases**: iOS users, reimbursement/corporate card tracking, foreign trips (temp SIM = no bank SMS)
