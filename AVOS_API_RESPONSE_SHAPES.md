# AVOS Components - API Response Shapes

This document defines the expected JSON response structures for all API endpoints used by the AVOS components.

---

## Configuration Endpoints

### GET /api/avos/config?restaurantId={id}

**Response (200 OK):**
```json
{
  "enabled": true,
  "phone_number": "+14155552671",
  "primary_language": "EN",
  "supported_languages": ["EN", "中文", "粵語", "ES"],
  "ai_engine": "google-gemini-2.0",
  "enable_upselling": true,
  "enable_call_recording": false,
  "sms_payment_enabled": true,
  "transfer_phone": "+14155552672",
  "custom_greetings": {
    "EN": "Welcome to [Restaurant Name], how can I help you?",
    "中文": "欢迎来到[餐厅名称]，我能帮您什么?",
    "粵語": "歡迎來到[餐廳名稱]，我可以點樣幫您?",
    "ES": "Bienvenido a [Nombre del Restaurante], ¿cómo puedo ayudarte?"
  }
}
```

**Error Response (404/500):**
```json
{
  "error": "Configuration not found",
  "message": "No AVOS config for restaurant {restaurantId}"
}
```

---

### POST /api/avos/config

**Request Body:**
```json
{
  "restaurantId": "rest_123abc",
  "enabled": true,
  "phone_number": "+14155552671",
  "primary_language": "EN",
  "supported_languages": ["EN", "中文", "粵語"],
  "ai_engine": "google-gemini-2.0",
  "enable_upselling": true,
  "enable_call_recording": false,
  "sms_payment_enabled": true,
  "transfer_phone": "+14155552672",
  "custom_greetings": {
    "EN": "Welcome to our restaurant",
    "中文": "欢迎来到我们的餐厅",
    "粵語": "歡迎來到我們的餐廳"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Configuration saved successfully",
  "config": {
    "enabled": true,
    "phone_number": "+14155552671",
    "primary_language": "EN",
    "supported_languages": ["EN", "中文", "粵語"],
    "ai_engine": "google-gemini-2.0",
    "enable_upselling": true,
    "enable_call_recording": false,
    "sms_payment_enabled": true,
    "transfer_phone": "+14155552672",
    "custom_greetings": {
      "EN": "Welcome to our restaurant",
      "中文": "欢迎来到我们的餐厅",
      "粵語": "歡迎來到我們的餐廳"
    },
    "updated_at": "2025-02-14T08:30:00Z"
  }
}
```

---

### POST /api/avos/menu-sync

**Request Body:**
```json
{
  "restaurantId": "rest_123abc"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Menu synchronized successfully",
  "stats": {
    "total_items": 45,
    "categories": 8,
    "variants": 23,
    "synced_at": "2025-02-14T08:31:00Z"
  }
}
```

---

## Call Monitoring Endpoints

### GET /api/avos/calls?restaurantId={id}&status=in_progress&limit=1

**Response (200 OK) - Active Call:**
```json
{
  "active_call": {
    "id": "call_abc123xyz",
    "caller_phone": "+16505551234",
    "duration_seconds": 145,
    "language": "EN",
    "dialog_state": "taking_order",
    "last_transcript_line": "Do you want extra sauce on your pizza?",
    "current_order_items": [
      "Large Pepperoni Pizza",
      "Caesar Salad",
      "Garlic Bread"
    ],
    "started_at": "2025-02-14T08:25:00Z"
  },
  "summary": {
    "total_calls": 12,
    "total_orders": 8,
    "total_revenue": 234.50
  }
}
```

**Response (200 OK) - No Active Call:**
```json
{
  "active_call": null,
  "summary": {
    "total_calls": 12,
    "total_orders": 8,
    "total_revenue": 234.50
  }
}
```

---

### GET /api/avos/calls?restaurantId={id}&limit=20&offset=0&dateRange=7days

**Response (200 OK):**
```json
{
  "calls": [
    {
      "id": "call_abc123xyz",
      "caller_phone": "+16505551234",
      "duration_seconds": 450,
      "language": "EN",
      "items_ordered": [
        "Large Pepperoni Pizza",
        "Caesar Salad",
        "Garlic Bread"
      ],
      "total_amount": 34.99,
      "status": "completed",
      "created_at": "2025-02-14T08:25:00Z"
    },
    {
      "id": "call_def456uvw",
      "caller_phone": "+16505555678",
      "duration_seconds": 180,
      "language": "中文",
      "items_ordered": [
        "Kung Pao Chicken",
        "Fried Rice"
      ],
      "total_amount": 24.50,
      "status": "completed",
      "created_at": "2025-02-13T19:45:30Z"
    }
  ],
  "total": 47,
  "offset": 0,
  "limit": 20
}
```

---

### GET /api/avos/calls/{callId}?restaurantId={id}

**Response (200 OK):**
```json
{
  "id": "call_abc123xyz",
  "caller_phone": "+16505551234",
  "duration_seconds": 450,
  "language": "EN",
  "items_ordered": [
    "Large Pepperoni Pizza",
    "Caesar Salad",
    "Garlic Bread"
  ],
  "total_amount": 34.99,
  "status": "completed",
  "created_at": "2025-02-14T08:25:00Z",
  "transcript": [
    {
      "speaker": "ai",
      "text": "Welcome to Pizza Palace, how can I help you today?",
      "timestamp": "08:25:05"
    },
    {
      "speaker": "customer",
      "text": "I'd like a large pepperoni pizza please",
      "timestamp": "08:25:12"
    },
    {
      "speaker": "ai",
      "text": "Great! Would you like to add any sides?",
      "timestamp": "08:25:18"
    },
    {
      "speaker": "customer",
      "text": "Yes, Caesar salad and garlic bread",
      "timestamp": "08:25:25"
    },
    {
      "speaker": "ai",
      "text": "Perfect! Your total is $34.99. How would you like to pay?",
      "timestamp": "08:25:32"
    },
    {
      "speaker": "customer",
      "text": "Credit card",
      "timestamp": "08:25:38"
    },
    {
      "speaker": "ai",
      "text": "Great! I'm processing your payment now.",
      "timestamp": "08:25:45"
    }
  ]
}
```

---

## Analytics Endpoints

### GET /api/avos/analytics?restaurantId={id}&period=week

**Response (200 OK):**
```json
{
  "total_calls": 47,
  "prev_total_calls": 38,
  "successful_orders": 35,
  "prev_successful_orders": 28,
  "successful_orders_percentage": 74.5,
  "average_order_value": 28.75,
  "prev_average_order_value": 26.50,
  "total_revenue": 1009.25,
  "prev_total_revenue": 742.00,
  "popular_items": [
    {
      "name": "Pepperoni Pizza (Large)",
      "count": 12,
      "revenue": 179.88
    },
    {
      "name": "Caesar Salad",
      "count": 9,
      "revenue": 67.41
    },
    {
      "name": "Garlic Bread",
      "count": 8,
      "revenue": 39.92
    },
    {
      "name": "Chicken Wings (10pc)",
      "count": 7,
      "revenue": 62.93
    },
    {
      "name": "Coca Cola (2L)",
      "count": 5,
      "revenue": 14.95
    }
  ],
  "language_distribution": [
    {
      "language": "EN",
      "percentage": 62.5,
      "count": 28
    },
    {
      "language": "ES",
      "percentage": 22.5,
      "count": 10
    },
    {
      "language": "中文",
      "percentage": 12.5,
      "count": 5
    },
    {
      "language": "粵語",
      "percentage": 2.5,
      "count": 4
    }
  ]
}
```

**Period Values:**
- `today` - Current calendar day
- `week` - Last 7 days (including today)
- `month` - Last 30 days (including today)
- `all` - All time data

---

## Error Response Format

All endpoints should return errors in this format:

**400 Bad Request:**
```json
{
  "error": "invalid_request",
  "message": "Missing required parameter: restaurantId",
  "status": 400
}
```

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required",
  "status": 401
}
```

**403 Forbidden:**
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this restaurant",
  "status": 403
}
```

**404 Not Found:**
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "status": 404
}
```

**500 Internal Server Error:**
```json
{
  "error": "server_error",
  "message": "An unexpected error occurred",
  "status": 500
}
```

---

## Data Type Definitions

### Language
```typescript
type Language = 'EN' | '中文' | '粵語' | 'ES';
```

### AI Engine
```typescript
type AIEngine = 'google-gemini-2.0' | 'amazon-nova-sonic';
```

### Call Status
```typescript
type CallStatus = 'completed' | 'failed' | 'transferred' | 'in_progress';
```

### Dialog States (examples)
```typescript
type DialogState =
  | 'greeting'
  | 'taking_order'
  | 'confirming_order'
  | 'processing_payment'
  | 'completed'
  | 'transferred_to_human';
```

### Speaker (Transcript)
```typescript
type Speaker = 'ai' | 'customer';
```

---

## Timestamp Format

All timestamps use ISO 8601 format with timezone:
- `2025-02-14T08:30:00Z` (UTC)
- `2025-02-14T08:30:00+00:00` (explicit UTC offset)

Components format these for display as:
- Short time: `"Feb 14, 08:30 AM"`
- Transcript time: `"08:30:05"` (HH:MM:SS)

---

## Phone Number Format

- Input: E.164 format `"+{country_code}{number}"` (e.g., `"+14155552671"`)
- Display in components: Masked as `"***-***-1234"` for privacy

---

## Currency Format

- All monetary values in USD (or main currency)
- Stored as numbers: `34.99` (not strings)
- Displayed with 2 decimal places: `$34.99`

---

## Implementation Notes

1. **Pagination:** Offset/limit model. Set `limit=20` and increment `offset` by 20 for "Load More"
2. **Date Ranges:** Use `dateRange` query param with values: `7days`, `30days`, `all`
3. **Status Codes:** Use standard HTTP status codes
4. **Error Details:** Include `error` code and `message` for debugging
5. **Timestamp Consistency:** All timestamps in UTC with timezone indicator
6. **Null Handling:** Use `null` for missing optional fields (not empty strings)
7. **Array Ordering:** Results should be ordered by creation date (newest first) unless specified
