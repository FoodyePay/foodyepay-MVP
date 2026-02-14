# AVOS Restaurant Dashboard Components - Integration Guide

## Overview
Four React components have been created for the AVOS restaurant dashboard in FoodyePay. These components are fully self-contained, use client-side rendering, and follow the existing dark theme patterns.

## Components Created

### 1. AVOSConfigPanel.tsx
**Location:** `/components/avos/AVOSConfigPanel.tsx`

**Purpose:** Configuration panel for restaurant owners to set up AVOS settings.

**Props:**
```typescript
{
  restaurantId: string;
  onConfigSaved?: () => void;
}
```

**Features:**
- Enable/disable AVOS toggle switch
- Phone number input (E.164 format)
- Primary language dropdown (EN/中文/粵語/ES)
- Supported languages multi-select
- AI engine selection (Google Gemini 2.0 / Amazon Nova Sonic)
- Feature toggles: upselling, call recording, SMS payment
- Transfer phone fallback number
- Per-language custom greeting textareas
- Save configuration → POST `/api/avos/config`
- Sync menu → POST `/api/avos/menu-sync`
- Toast notifications for success/error feedback

---

### 2. AVOSLiveWidget.tsx
**Location:** `/components/avos/AVOSLiveWidget.tsx`

**Purpose:** Real-time call monitoring widget for dashboard.

**Props:**
```typescript
{
  restaurantId: string;
}
```

**Features:**
- Polls `/api/avos/calls?restaurantId=...&status=in_progress&limit=1` every 5 seconds
- **Active Call Display:**
  - Pulsing green indicator
  - Masked caller phone (***-***-1234)
  - Duration timer (updates every second)
  - Language badge
  - Dialog state badge
  - Last transcript line
  - Current order items (shows first 3, plus count of remaining)
- **No Call Display:**
  - Gray indicator
  - Today's summary: call count, order count, revenue total
- Compact card design

---

### 3. AVOSCallHistory.tsx
**Location:** `/components/avos/AVOSCallHistory.tsx`

**Purpose:** Call history table with transcript viewing and filtering.

**Props:**
```typescript
{
  restaurantId: string;
}
```

**Features:**
- Fetches from `/api/avos/calls?restaurantId=...&limit=20&offset=0`
- Table columns: Date/Time, Duration, Language, Items, Total, Status, Actions
- Status badges: completed (green), failed (red), transferred (yellow), in_progress (blue)
- Expandable rows showing full transcript with timestamps
- Alternating AI/Customer messages in transcript
- Date range filter: Last 7 days / 30 days / All time
- Pagination with "Load More" button
- Empty state: "No calls yet. Enable AVOS to start receiving AI-powered orders."

---

### 4. AVOSAnalytics.tsx
**Location:** `/components/avos/AVOSAnalytics.tsx`

**Purpose:** Performance analytics and insights for AVOS usage.

**Props:**
```typescript
{
  restaurantId: string;
}
```

**Features:**
- Time period selector: Today / This Week / This Month / All Time
- **Stat Cards (Top Row):**
  - Total Calls (with trend)
  - Successful Orders (with trend)
  - Average Order Value (with trend)
  - Revenue from AVOS (with trend)
  - Each shows trend arrow (up green / down red) with percentage change
- **Popular Items Section:**
  - Top 5 items ordered via AVOS
  - Shows count and revenue per item
  - Rank badge (#1, #2, etc.)
- **Language Distribution:**
  - Horizontal bar chart showing % per language
  - Color-coded: EN (blue), 中文 (red), 粵語 (orange), ES (green)
  - Shows count and percentage

---

## Dashboard Integration Steps

To integrate these components into your restaurant dashboard page, make the following modifications:

### 1. Import Components
```typescript
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';
```

### 2. Add to Dashboard Layout

The suggested layout structure for the dashboard page:

```typescript
export default function RestaurantDashboard({ restaurantId }: Props) {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Restaurant Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your AVOS voice ordering system
        </p>
      </div>

      {/* Top Row: Live Widget + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AVOSLiveWidget restaurantId={restaurantId} />
        </div>
        {/* Other dashboard widgets here */}
      </div>

      {/* Analytics Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          AVOS Performance
        </h2>
        <AVOSAnalytics restaurantId={restaurantId} />
      </section>

      {/* Configuration & History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel takes up 1 column, History takes up 2 columns */}
        <div>
          <AVOSConfigPanel
            restaurantId={restaurantId}
            onConfigSaved={() => {
              // Optional: refresh other components after config save
            }}
          />
        </div>
        <div className="lg:col-span-2">
          <AVOSCallHistory restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
}
```

### 3. Ensure API Endpoints Exist

These components expect the following API routes. **Verify these exist** or create them:

#### Configuration
- `GET /api/avos/config?restaurantId=...` - Fetch AVOS config
- `POST /api/avos/config` - Save AVOS config (body: `{ restaurantId, ...config }`)
- `POST /api/avos/menu-sync` - Sync menu to AVOS index (body: `{ restaurantId }`)

#### Calls & Monitoring
- `GET /api/avos/calls?restaurantId=...&status=in_progress&limit=1` - Get active call
- `GET /api/avos/calls?restaurantId=...&limit=20&offset=0&dateRange=7days|30days|all` - Get call history
- `GET /api/avos/calls/{callId}?restaurantId=...` - Get call details with transcript

#### Analytics
- `GET /api/avos/analytics?restaurantId=...&period=today|week|month|all` - Get analytics data

### 4. Environment Setup

Ensure these are configured in your `.env.local` or environment:
- Supabase client (already used by other components)
- AVOS API credentials (if calling external AVOS service)

### 5. Styling Verification

All components use:
- **Dark theme classes:** `dark:bg-zinc-900`, `dark:bg-gray-800`, `dark:border-gray-700`, `dark:text-white`
- **Primary color:** `#222c4e` (used in custom CSS if needed)
- **Hover color:** `#454b80`
- **Gradient buttons:** `bg-gradient-to-r from-purple-600 to-blue-600`
- **Status badges:** Standard dark theme patterns
- **Icons from lucide-react**

No additional styling imports needed—components use Tailwind CSS inline.

---

## Component Behavior Summary

| Component | Polls API | Updates | Expandable | Configurable |
|-----------|-----------|---------|-----------|--------------|
| AVOSConfigPanel | No | On save | No | Yes (full settings) |
| AVOSLiveWidget | Yes (5s) | Real-time | No | No (display only) |
| AVOSCallHistory | No | On load | Yes (transcripts) | Yes (date filter) |
| AVOSAnalytics | No | On period change | No | Yes (time period) |

---

## Data Flow

1. **Config Panel** → User configures AVOS → POST to `/api/avos/config`
2. **Live Widget** → Polls active calls every 5s → Shows real-time status
3. **Call History** → Loads past calls with optional expand → Shows transcripts
4. **Analytics** → Loads aggregated stats → Displays trends and distributions

---

## Notes

- All components are **'use client'** directives (Next.js 14 client components)
- Error handling: Toast notifications and console logs
- Loading states: Skeleton loaders for config/analytics, real-time updates for widget
- No Supabase calls needed—these use REST API via `fetch()`
- Fully responsive: Mobile-first design with Tailwind breakpoints
- Dark theme fully supported throughout

---

## File Locations

```
components/avos/
├── AVOSConfigPanel.tsx        (Configuration settings)
├── AVOSLiveWidget.tsx         (Real-time monitoring)
├── AVOSCallHistory.tsx        (Call history & transcripts)
└── AVOSAnalytics.tsx          (Performance analytics)
```

All files are production-ready and follow FoodyePay design patterns.
