# AVOS API Routes & Payment System - Complete Implementation

## Overview

This document describes the complete AVOS (AI Voice Ordering System) payment processing and API infrastructure implemented for FoodyePay. All files follow Next.js 14 App Router patterns with NextRequest/NextResponse and production-grade error handling.

---

## Files Created

### 1. Core Payment Processor
**File:** `/lib/avos/payment-processor.ts` (12 KB)

The central payment processing engine handling all financial operations:

#### Key Methods:
- **`calculateOrderTotal(items, state, zipCode)`**
  - Computes subtotal from items
  - Calculates tax based on state using existing taxService
  - Converts total USD to FOODY tokens
  - Returns: `{ subtotalUsd, taxUsd, totalUsd, foodyAmount, exchangeRate }`

- **`generatePaymentLink(payload)`**
  - Creates JWT-secured SMS payment link
  - Token expires in 30 minutes (configurable via env)
  - Payload includes order details + restaurant wallet
  - Returns full payment URL ready for SMS

- **`verifyPaymentToken(token)` (static)**
  - Validates JWT signature and expiration
  - Extracts PaymentLinkPayload from token
  - Returns null if expired or invalid

- **`sendPaymentSMS(customerPhone, paymentLink, restaurantName, totalUsd)`**
  - Sends SMS via Twilio with payment link
  - Handles missing Twilio configuration gracefully
  - Returns boolean success status

- **`createAVOSOrder(callId, restaurantId, customerPhone, items, state, zipCode)`**
  - Creates order record in `avos_orders` table
  - Generates secure payment token
  - Returns complete AVOSOrder object

- **`updatePaymentStatus(paymentToken, status, txHash?)`**
  - Updates order payment status (pending/completed/expired/failed)
  - Sets confirmed_at timestamp on completion
  - Records blockchain txHash if provided

- **`syncToMainOrderTables(avosOrder, restaurantWallet, restaurantName)`**
  - Creates records in main `orders` table
  - Creates corresponding `confirm_and_pay` record
  - Links AVOS order to restaurant dashboard
  - Returns mainOrderId

#### Dependencies:
- `supabaseAdmin` (service role for admin operations)
- `calculateTax`, `getTaxRateByState` from taxService
- `getFoodyPrice`, `convertUsdcToFoody` from foodyTokenService
- `twilio` for SMS delivery
- `jose` for JWT signing/verification

---

### 2. Google CCAI Webhook Handler
**File:** `/app/api/avos/webhook/route.ts` (11 KB)

Processes incoming voice call events from Google Conversational Call AI.

#### Event Types Handled:
- **`call_initiated`**: New incoming call detected
  - Creates `avos_calls` record
  - Returns greeting message from restaurant config
  - Stores call metadata

- **`transcript_update`**: New speech transcription available
  - Analyzes user intent via voice provider
  - Runs through DialogStateMachine
  - Updates call record with transcript
  - Returns AI response

- **`call_ended`**: Call disconnected
  - Finalizes call record
  - Sets end time and duration
  - Updates call status

- **`call_failed`**: Call error or disconnection
  - Marks call as failed
  - Sets end timestamp

#### Features:
- Webhook signature validation (HMAC-SHA256)
- Error handling with recovery messaging
- Automatic restaurant lookup via phone number
- Integration with DialogStateMachine for conversation flow
- Transcript accumulation across call duration

#### Response Format:
```json
{
  "success": true,
  "greeting": "Welcome to Restaurant...",
  "response": "AI response text",
  "action": "collect_payment" // optional
}
```

---

### 3. Process Order Endpoint
**File:** `/app/api/avos/process-order/route.ts` (6.6 KB)

Finalizes AVOS order after voice conversation.

#### POST Endpoint
**Request:**
```json
{
  "callId": "uuid",
  "restaurantId": "uuid",
  "customerPhone": "+1234567890",
  "items": [
    {
      "menuItemId": "uuid",
      "name": "Item Name",
      "quantity": 2,
      "priceUsd": 12.50,
      "modifications": ["no salt", "extra spicy"]
    }
  ],
  "state": "NY",
  "zipCode": "10001"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "callId": "uuid",
    "restaurantId": "uuid",
    "restaurantName": "Restaurant Name",
    "customerPhone": "+1234567890",
    "items": [...],
    "subtotalUsd": 25.00,
    "taxUsd": 2.22,
    "totalUsd": 27.22,
    "foodyAmount": 226340,
    "exchangeRate": 8308.55,
    "paymentLink": "https://foodyepay.com/avos/payment/[token]",
    "paymentToken": "secure_token_32_chars",
    "smsSent": true,
    "createdAt": "2024-02-14T..."
  }
}
```

#### Validation:
- UUID format for callId, restaurantId, menuItemIds
- E.164 phone format
- Item quantities and prices > 0
- Valid US state code (2 chars)
- Valid ZIP code (5 or 9 digits)

#### Flow:
1. Validate all request fields
2. Verify restaurant exists
3. Create AVOS order record
4. Calculate totals and tax
5. Generate JWT payment link
6. Send SMS to customer
7. Sync to main order tables
8. Return complete order details

---

### 4. Restaurant Configuration Endpoint
**File:** `/app/api/avos/config/route.ts` (7.9 KB)

Manages AVOS configuration per restaurant.

#### GET Endpoint
**Query Parameters:**
- `restaurantId` (required, UUID)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "avosEnabled": true,
  "phoneNumber": "+14155552671",
  "primaryLanguage": "en",
  "supportedLanguages": ["en", "zh", "es"],
  "aiEngine": "google_gemini_2",
  "greetingMessage": {
    "en": "Welcome to our restaurant!",
    "zh": "欢迎...",
    "es": "Bienvenido..."
  },
  "maxCallDurationSeconds": 600,
  "enableRecording": false,
  "enableUpselling": true,
  "autoPaymentEnabled": false,
  "smsPaymentEnabled": true,
  "transferToHumanPhone": "+14155552672",
  "createdAt": "2024-01-01T...",
  "updatedAt": "2024-02-14T..."
}
```

#### POST Endpoint
**Request:**
```json
{
  "restaurantId": "uuid",
  "avosEnabled": true,
  "phoneNumber": "+14155552671",
  "primaryLanguage": "en",
  "supportedLanguages": ["en", "zh", "yue", "es"],
  "aiEngine": "google_gemini_2",
  "greetingMessage": { ... },
  "maxCallDurationSeconds": 900,
  "enableRecording": false,
  "enableUpselling": true,
  "autoPaymentEnabled": false,
  "smsPaymentEnabled": true,
  "transferToHumanPhone": "+14155552672"
}
```

**Response (201 Created or 200 OK for update):**
```json
{
  "success": true,
  "config": { ... }
}
```

#### Features:
- Creates default config if doesn't exist
- Validates restaurant exists
- Supports multiple languages and AI engines
- One-to-one relationship with restaurants table
- Auto-saves timestamps

---

### 5. Call History Endpoint
**File:** `/app/api/avos/calls/route.ts` (4.8 KB)

Retrieves paginated call history with advanced filtering.

#### GET Endpoint
**Query Parameters:**
- `restaurantId` (required, UUID)
- `limit` (optional, default 20, max 100)
- `offset` (optional, default 0)
- `status` (optional, one of: initiated, connected, in_progress, completed, failed, transferred)
- `startDate` (optional, ISO 8601)
- `endDate` (optional, ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "calls": [
    {
      "id": "uuid",
      "restaurantId": "uuid",
      "callerPhone": "+1234567890",
      "restaurantPhone": "+14155552671",
      "language": "en",
      "durationSeconds": 342,
      "callStatus": "completed",
      "transcript": [
        {
          "role": "ai",
          "text": "Welcome...",
          "language": "en",
          "timestamp": "2024-02-14T12:00:00Z",
          "confidence": 0.95
        }
      ],
      "aiEngine": "google_gemini_2",
      "dialogState": "CLOSING",
      "orderId": "uuid",
      "startedAt": "2024-02-14T12:00:00Z",
      "endedAt": "2024-02-14T12:05:42Z",
      "createdAt": "2024-02-14T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 145,
    "hasMore": true
  }
}
```

#### Features:
- Ordered by creation date (newest first)
- Date range filtering
- Status filtering
- Efficient pagination with total count
- Detailed conversation transcripts

---

### 6. Menu Synchronization Endpoint
**File:** `/app/api/avos/menu-sync/route.ts` (5.0 KB)

Rebuilds the AVOS menu search index with phonetic variations.

#### POST Endpoint
**Request:**
```json
{
  "restaurantId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "synced": 47,
  "restaurantId": "uuid",
  "total": 47,
  "message": "Menu sync completed successfully"
}
```

#### Flow:
1. Fetch all menu items for restaurant
2. Generate phonetic variations (English, Pinyin, Jyutping)
3. Delete old index entries
4. Insert new entries in 50-item batches
5. Return sync summary

#### Menu Index Entry Structure:
```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "menuItemId": "uuid",
  "itemName": "Kung Pao Chicken",
  "itemNameZh": "宫保鸡丁",
  "itemNameYue": "宮保雞丁",
  "itemNameEs": "Pollo Kung Pao",
  "aliases": [],
  "phoneticEn": "kung pow chicken",
  "phoneticZh": "gong bao ji ding",
  "phoneticYue": "gung bou gai ding",
  "category": "Main Courses",
  "priceUsd": 12.99,
  "isAvailable": true
}
```

#### Features:
- Batch insertion (prevents payload size limits)
- Phonetic generation via existing phonetic-utils
- Error recovery (continues on batch failure)
- Complete menu replacement (safe delete + insert)

---

### 7. Test Call Simulation Endpoint
**File:** `/app/api/avos/test-call/route.ts` (8.4 KB)

Simulates complete voice call for development and testing.

#### POST Endpoint (Development Only)
**Request:**
```json
{
  "restaurantId": "uuid",
  "callerPhone": "+1234567890",
  "language": "en",
  "messages": [
    {
      "role": "customer",
      "text": "I'd like to order a pizza"
    },
    {
      "role": "customer",
      "text": "Margherita, large"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "testCall": {
    "callId": "test-1707918000000-abc123def",
    "restaurantId": "uuid",
    "callerPhone": "+1234567890",
    "language": "en",
    "finalState": "PAYMENT",
    "orderItems": [
      {
        "menuItemId": "uuid",
        "name": "Margherita Pizza",
        "quantity": 1,
        "priceUsd": 14.99,
        "modifications": []
      }
    ],
    "subtotalUsd": 14.99,
    "transcript": [
      {
        "role": "ai",
        "text": "Welcome!",
        "language": "en",
        "timestamp": "2024-02-14T..."
      },
      {
        "role": "customer",
        "text": "I'd like to order a pizza",
        ...
      }
    ],
    "paymentLink": "https://foodyepay.com/avos/payment/[token]",
    "context": {
      "orderItems": 1,
      "errorCount": 0,
      "upsellOffered": false,
      "orderConfirmed": true,
      "paymentInitiated": true
    }
  }
}
```

#### Features:
- Only available in development (NODE_ENV check)
- Simulates full conversation flow
- Generates test payment link if order created
- Validates 1-50 messages per call
- Returns complete conversation transcript
- Shows final dialog state

#### Validation:
- Restaurant config must exist
- Valid phone format (E.164)
- Supported language
- 1-50 message limit
- All messages have text content

---

### 8. SMS Payment Page (Client Component)
**File:** `/app/avos/payment/[token]/page.tsx` (14 KB)

Customer-facing payment page accessed via SMS link.

#### Route: `/avos/payment/[token]`

#### Features:

##### Token Verification
- Validates JWT token from URL
- Checks expiration time
- Shows error if expired
- Displays remaining time (countdown)

##### UI Components
- **Order Summary**
  - Restaurant name
  - Itemized list with modifications
  - Subtotal, tax, total in USD
  - Scrollable items (max 48 height)

- **FOODY Payment Info**
  - FOODY amount
  - Exchange rate (FOODY/USD)
  - Total USD value

- **Wallet Connection**
  - Connect wallet button (via Coinbase Smart Wallet)
  - Shows connected wallet address
  - Displays FOODY balance
  - Auto-updates on connection

- **Payment Control**
  - Pay button with FOODY amount
  - Disabled until wallet connected
  - Disabled if balance insufficient
  - Shows error if insufficient FOODY
  - Processing state with spinner

- **Success State**
  - ✓ Confirmation message
  - Transaction hash display
  - Persists after successful payment

- **Timer**
  - Real-time countdown (updates every second)
  - Shows M:SS format
  - Automatically expiry handling
  - Cannot pay after expiration

#### Styling
- Dark theme: `bg-zinc-900`, dark borders
- Primary color: `#222c4e` accent (blue-600)
- Mobile-optimized
- Responsive to SMS/browser context

#### Props
- `token` (from URL params): JWT payment link token

#### Hooks Used
- `useParams()` for route params
- `useAccount()` for wallet connection
- `useWagmiConfig()` for blockchain ops
- `useState()` for component state
- `useEffect()` for token verification, timer, balance checking

#### Dependencies
- `Providers` wrapper (OnchainProviders + WalletProvider)
- `paymentProcessor.verifyPaymentToken()`
- `checkFoodyBalance()`
- `WalletConnectButton` component
- `wagmi` for wallet functionality

#### User Flow
1. **Link Received**: Customer gets SMS with payment link
2. **Page Load**: Token verified, order displayed
3. **Wallet Connect**: Click button to connect Coinbase Smart Wallet
4. **Review**: Customer reviews order + amount
5. **Payment**: Click "Pay" button to execute transaction
6. **Confirmation**: Success message with transaction hash

---

## Environment Variables Required

```bash
# Webhook Configuration
AVOS_WEBHOOK_SECRET=your_webhook_secret_key

# SMS Payment Link
NEXT_PUBLIC_PAYMENT_LINK_BASE_URL=https://foodyepay.com/avos/payment
AVOS_SMS_PAYMENT_LINK_EXPIRY_MINUTES=30

# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155552671

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Database Tables Required

### avos_calls
```sql
CREATE TABLE avos_calls (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  caller_phone TEXT NOT NULL,
  restaurant_phone TEXT NOT NULL,
  language TEXT NOT NULL,
  call_status TEXT NOT NULL,
  call_recording_url TEXT,
  transcript JSONB,
  ai_engine TEXT NOT NULL,
  dialog_state TEXT NOT NULL,
  order_id UUID,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

### avos_orders
```sql
CREATE TABLE avos_orders (
  id UUID PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES avos_calls(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal_usd NUMERIC(10,2) NOT NULL,
  tax_usd NUMERIC(10,2) NOT NULL,
  total_usd NUMERIC(10,2) NOT NULL,
  foody_amount NUMERIC(20,8) NOT NULL,
  exchange_rate NUMERIC(20,8) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_link TEXT,
  payment_token TEXT UNIQUE,
  payment_status TEXT NOT NULL,
  tx_hash TEXT,
  order_id UUID REFERENCES orders(id),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL
);
```

### avos_configs
```sql
CREATE TABLE avos_configs (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL UNIQUE REFERENCES restaurants(id),
  avos_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  phone_number TEXT,
  primary_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] DEFAULT '{"en"}',
  ai_engine TEXT NOT NULL DEFAULT 'google_gemini_2',
  greeting_message JSONB,
  max_call_duration_seconds INTEGER DEFAULT 600,
  enable_recording BOOLEAN DEFAULT FALSE,
  enable_upselling BOOLEAN DEFAULT TRUE,
  auto_payment_enabled BOOLEAN DEFAULT FALSE,
  sms_payment_enabled BOOLEAN DEFAULT TRUE,
  transfer_to_human_phone TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### avos_menu_index
```sql
CREATE TABLE avos_menu_index (
  id UUID PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  item_name_zh TEXT,
  item_name_yue TEXT,
  item_name_es TEXT,
  aliases TEXT[],
  phonetic_en TEXT,
  phonetic_zh TEXT,
  phonetic_yue TEXT,
  category TEXT,
  price_usd NUMERIC(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

## Error Handling & Logging

All endpoints include:
- **[AVOS] logging prefix** for easy filtering
- Detailed error messages in console
- Validation of all inputs
- Graceful degradation (e.g., SMS non-fatal)
- HTTP status codes per REST conventions
- Error details in response JSON

### Status Codes
- **200 OK**: Successful GET or status check
- **201 Created**: New resource created (POST successful)
- **400 Bad Request**: Invalid input validation
- **401 Unauthorized**: Webhook signature invalid
- **403 Forbidden**: Test endpoint in production
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server processing failure

---

## Security Features

1. **JWT Payment Links**: Signed tokens with 30-min expiration
2. **Webhook Signature Validation**: HMAC-SHA256 verification
3. **UUID Validation**: All IDs verified as UUIDs
4. **E.164 Phone Format**: All phone numbers validated
5. **Service Role Key**: Admin operations bypass RLS
6. **Input Validation**: All POST bodies validated before use
7. **Environment Secrets**: Sensitive values via env vars

---

## Testing

### Test Endpoint Usage
```bash
curl -X POST http://localhost:3000/api/avos/test-call \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "uuid",
    "callerPhone": "+14155552671",
    "language": "en",
    "messages": [
      { "role": "customer", "text": "Hi, I want to order" },
      { "role": "customer", "text": "Pad Thai, large" }
    ]
  }'
```

### Development Environment
- Test endpoints only active when `NODE_ENV !== 'production'`
- Full error messages logged to console
- Payment link generation tested without Twilio
- Menu sync can be tested without live menu

---

## Integration Points

### Existing Services Used:
1. **taxService**: `calculateTax()`, `getTaxRateByState()`
2. **foodyTokenService**: `getFoodyPrice()`, `convertUsdcToFoody()`
3. **transactionService**: `saveTransactionRecord()`
4. **supabaseAdmin**: Service-role authenticated database
5. **DialogStateMachine**: Conversation state management
6. **ProviderFactory**: AI engine selection
7. **VoiceAIProvider**: Intent analysis and generation

### Payment Flow Integration:
1. AVOS conversation → order creation
2. Order details → payment processor
3. Payment link → SMS via Twilio
4. Customer payment → order status update
5. Success → transaction record creation

---

## Performance Optimizations

1. **Batch Menu Sync**: 50-item batches prevent payload overflow
2. **Pagination**: Call history limited to 100 items max
3. **Efficient Queries**: Select only needed columns
4. **JWT Local Validation**: No database lookup for token verification
5. **Caching**: FOODY price cached per token generation
6. **Service Role**: Single authenticated connection vs. per-user

---

## Monitoring & Debugging

Enable detailed logging:
```bash
# Filter all AVOS logs
grep -i '\[AVOS\]' logs/*.log

# Monitor specific endpoint
tail -f logs/webhook.log | grep AVOS
```

All endpoints output structured logs with timestamps and context.

---

## File Summary Table

| File | Size | Purpose | Routes |
|------|------|---------|--------|
| payment-processor.ts | 12 KB | Core payment logic | Library |
| webhook/route.ts | 11 KB | CCAI webhook | POST /api/avos/webhook |
| process-order/route.ts | 6.6 KB | Order finalization | POST /api/avos/process-order |
| config/route.ts | 7.9 KB | Restaurant config | GET/POST /api/avos/config |
| calls/route.ts | 4.8 KB | Call history | GET /api/avos/calls |
| menu-sync/route.ts | 5.0 KB | Menu indexing | POST /api/avos/menu-sync |
| test-call/route.ts | 8.4 KB | Test simulation | POST /api/avos/test-call |
| payment/[token]/page.tsx | 14 KB | Payment UI | GET /avos/payment/[token] |

**Total: ~70 KB of production-ready code**

---

## Next Steps

1. **Webhook Registration**: Configure CCAI to send events to `/api/avos/webhook`
2. **Database Migrations**: Create tables via Supabase or SQL scripts
3. **Environment Setup**: Add all required env vars
4. **Testing**: Use test-call endpoint to validate flow
5. **SMS Testing**: Configure Twilio credentials
6. **Wallet Integration**: Verify Coinbase Smart Wallet setup
7. **Menu Sync**: Run menu-sync for each restaurant
8. **Production Deploy**: Follow standard Next.js deployment

---

Generated: 2024-02-14
AVOS Implementation: Complete
