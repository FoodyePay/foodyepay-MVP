# AVOS API Quick Reference Guide

## File Locations

```
/lib/avos/payment-processor.ts          → Core payment logic class
/app/api/avos/webhook/route.ts          → Google CCAI webhook (POST)
/app/api/avos/process-order/route.ts    → Order finalization (POST)
/app/api/avos/config/route.ts           → Config GET/POST
/app/api/avos/calls/route.ts            → Call history (GET)
/app/api/avos/menu-sync/route.ts        → Menu index rebuild (POST)
/app/api/avos/test-call/route.ts        → Test simulation (POST, dev only)
/app/avos/payment/[token]/page.tsx      → SMS payment page
```

## Endpoint Quick Reference

### 1. Google CCAI Webhook
```
POST /api/avos/webhook

Header: x-google-webhook-signature: <HMAC-SHA256>

Body: CCAIWebhookEvent (call_initiated | transcript_update | call_ended | call_failed)

Response: { success, greeting?, response?, action? }
```

### 2. Process Order
```
POST /api/avos/process-order

Body: {
  callId: UUID,
  restaurantId: UUID,
  customerPhone: E.164,
  items: AVOSOrderItem[],
  state: "NY",
  zipCode: "10001"
}

Response (201): { success, order: { id, paymentLink, paymentToken, smsSent, ... } }
```

### 3. Restaurant Config
```
GET /api/avos/config?restaurantId=UUID
Response (200): AVOSConfig object

POST /api/avos/config
Body: { restaurantId, avosEnabled, phoneNumber, language, ... }
Response (201): { success, config }
```

### 4. Call History
```
GET /api/avos/calls?restaurantId=UUID&limit=20&offset=0&status=completed&startDate=ISO&endDate=ISO

Response (200): {
  success: true,
  calls: AVOSCall[],
  pagination: { limit, offset, total, hasMore }
}
```

### 5. Menu Sync
```
POST /api/avos/menu-sync

Body: { restaurantId: UUID }

Response (200): { success, synced: 47, total: 47, restaurantId }
```

### 6. Test Call (Dev Only)
```
POST /api/avos/test-call

Body: {
  restaurantId: UUID,
  callerPhone: E.164,
  language: "en" | "zh" | "yue" | "es",
  messages: [{ text: string }, ...]  // 1-50 messages
}

Response (200): {
  success: true,
  testCall: {
    callId, restaurantId, finalState, orderItems,
    transcript, paymentLink, context
  }
}
```

### 7. SMS Payment Page
```
GET /avos/payment/[token]

- Verifies JWT token from URL
- Shows order summary
- Connects Coinbase Smart Wallet
- Executes FOODY payment
- 30-minute expiry countdown
```

---

## Core Payment Processor Methods

```typescript
// Calculate order total with tax and FOODY conversion
async calculateOrderTotal(items, state, zipCode)
  → { subtotalUsd, taxUsd, totalUsd, foodyAmount, exchangeRate }

// Generate JWT-signed SMS payment link
async generatePaymentLink(payload)
  → "https://foodyepay.com/avos/payment/[token]"

// Verify payment link JWT token
static async verifyPaymentToken(token)
  → PaymentLinkPayload | null

// Send SMS via Twilio
async sendPaymentSMS(phone, link, restaurantName, total)
  → boolean

// Create AVOS order in database
async createAVOSOrder(callId, restaurantId, phone, items, state, zip)
  → AVOSOrder

// Update payment status after payment
async updatePaymentStatus(token, status, txHash?)
  → boolean

// Sync AVOS order to main order tables
async syncToMainOrderTables(avosOrder, wallet, name)
  → mainOrderId
```

---

## Common Validation

### UUID Format
```
^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
```

### E.164 Phone Format
```
^\+?[1-9]\d{1,14}$
```

### US State Code
```
2-letter uppercase: "NY", "CA", "TX", etc.
```

### ZIP Code
```
5 digits: "10001"
9 digits: "10001-1234"
```

---

## Error Responses

### 400 Bad Request
```json
{ "error": "Invalid callId" }
{ "error": "Invalid phone number format (E.164)" }
{ "error": "Order must contain at least one item" }
```

### 401 Unauthorized
```json
{ "error": "Invalid signature" }
```

### 403 Forbidden
```json
{ "error": "Test endpoint not available in production" }
```

### 404 Not Found
```json
{ "error": "Restaurant not found" }
{ "error": "Restaurant config not found" }
```

### 500 Internal Server Error
```json
{
  "error": "Payment link generation failed",
  "details": "..."
}
```

---

## Required Environment Variables

```bash
# AVOS Configuration
AVOS_WEBHOOK_SECRET=your_webhook_secret_key
NEXT_PUBLIC_PAYMENT_LINK_BASE_URL=https://foodyepay.com/avos/payment
AVOS_SMS_PAYMENT_LINK_EXPIRY_MINUTES=30

# Twilio SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+14155552671

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Payment Flow

```
Voice Call
    ↓
Dialog State Machine
    ↓
process-order endpoint
    ↓
Create AVOS order
    ↓
Calculate tax + FOODY
    ↓
Generate JWT payment link
    ↓
Send SMS to customer
    ↓
Customer receives link
    ↓
Opens /avos/payment/[token]
    ↓
Connects wallet
    ↓
Reviews order
    ↓
Clicks "Pay [amount] FOODY"
    ↓
Wallet confirms transaction
    ↓
updatePaymentStatus(token, 'completed', txHash)
    ↓
Success confirmation page
```

---

## Database Queries

### Create AVOS Call
```sql
INSERT INTO avos_calls (
  id, restaurant_id, caller_phone, restaurant_phone,
  language, call_status, ai_engine, dialog_state,
  started_at, transcript, duration_seconds, created_at
) VALUES (...)
```

### Create AVOS Order
```sql
INSERT INTO avos_orders (
  id, call_id, restaurant_id, customer_phone,
  items, subtotal_usd, tax_usd, total_usd,
  foody_amount, exchange_rate, payment_method,
  payment_token, payment_status, created_at
) VALUES (...)
```

### Update Payment Status
```sql
UPDATE avos_orders
SET payment_status = 'completed',
    confirmed_at = NOW(),
    tx_hash = $1
WHERE payment_token = $2
```

### Fetch Calls with Pagination
```sql
SELECT * FROM avos_calls
WHERE restaurant_id = $1
  AND ($2::text IS NULL OR call_status = $2)
  AND ($3::timestamp IS NULL OR created_at >= $3)
  AND ($4::timestamp IS NULL OR created_at <= $4)
ORDER BY created_at DESC
LIMIT $5 OFFSET $6
```

---

## Logging

All endpoints use `[AVOS]` prefix:

```
[AVOS] Webhook received: call_initiated
[AVOS] Processing order for call ...
[AVOS] Fetching config for restaurant: ...
[AVOS] Payment status updated successfully
[AVOS] Menu sync: 47 items indexed
```

Filter logs: `grep "\[AVOS\]" app.log`

---

## Testing with curl

### Test Call Simulation
```bash
curl -X POST http://localhost:3000/api/avos/test-call \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
    "callerPhone": "+14155552671",
    "language": "en",
    "messages": [
      { "role": "customer", "text": "Hi, I want to order" },
      { "role": "customer", "text": "Pad Thai, large" }
    ]
  }'
```

### Process Order
```bash
curl -X POST http://localhost:3000/api/avos/process-order \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "550e8400-e29b-41d4-a716-446655440001",
    "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
    "customerPhone": "+14155552671",
    "items": [
      {
        "menuItemId": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Pad Thai",
        "quantity": 1,
        "priceUsd": 12.99,
        "modifications": []
      }
    ],
    "state": "NY",
    "zipCode": "10001"
  }'
```

### Get Call History
```bash
curl "http://localhost:3000/api/avos/calls?restaurantId=550e8400-e29b-41d4-a716-446655440000&limit=10&status=completed"
```

### Check Config
```bash
curl "http://localhost:3000/api/avos/config?restaurantId=550e8400-e29b-41d4-a716-446655440000"
```

---

## Debugging

### Enable verbose logging
Check console for `[AVOS]` prefixed messages

### Verify JWT token
```bash
# The payment token is valid until 30 minutes from creation
# Check console logs for: "[AVOS] Generated payment link (length: XX chars)"
```

### Check Supabase records
```sql
-- View recent orders
SELECT * FROM avos_orders ORDER BY created_at DESC LIMIT 5;

-- View recent calls
SELECT * FROM avos_calls ORDER BY created_at DESC LIMIT 5;

-- View restaurant config
SELECT * FROM avos_configs WHERE restaurant_id = 'UUID';
```

### Test SMS without Twilio
- Twilio gracefully disabled if credentials missing
- SMS sending returns false, doesn't fail request
- Check console: "[AVOS] Twilio client not configured"

---

## Production Checklist

- [ ] Set all required environment variables
- [ ] Create database tables (4 new tables required)
- [ ] Configure Twilio credentials
- [ ] Register webhook URL with Google CCAI
- [ ] Test webhook signature validation
- [ ] Run menu sync for each restaurant
- [ ] Configure restaurant AVOS settings
- [ ] Test payment flow end-to-end
- [ ] Verify email notifications (if applicable)
- [ ] Monitor logs for [AVOS] prefix
- [ ] Set up error alerting
- [ ] Document payment link expiry time (30 min)
- [ ] Train support team on payment flow

---

## Support & Troubleshooting

### Payment link expired?
User gets: "Payment link has expired or is invalid"
→ SMS expires after 30 minutes, need to generate new order

### Restaurant not found?
Webhook can't find restaurant by phone
→ Verify phone_number in avos_configs matches incoming call number

### SMS not sent?
Check console: "SMS sending failed" warning
→ Verify Twilio credentials or check SMS queue

### Menu sync partial failure?
Some items failed to index
→ Check logs for batch number, investigate specific item
→ Retry menu-sync, batch size is 50 items

### Test endpoint doesn't work?
"Test endpoint not available in production"
→ Only works when NODE_ENV !== 'production'

---

Last Updated: 2024-02-14
Version: 1.0
Status: Production Ready
