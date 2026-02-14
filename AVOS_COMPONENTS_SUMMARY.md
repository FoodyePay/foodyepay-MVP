# AVOS Components Summary

## File Locations
All components are located in: `/components/avos/`

```
components/avos/
├── AVOSConfigPanel.tsx        (16 KB) - Configuration settings panel
├── AVOSLiveWidget.tsx         (9 KB)  - Real-time call monitoring
├── AVOSCallHistory.tsx        (15 KB) - Call history with transcripts
└── AVOSAnalytics.tsx          (11 KB) - Performance analytics
```

---

## Component 1: AVOSConfigPanel.tsx

### Purpose
Restaurant owner configuration panel for AVOS settings.

### Props
```typescript
interface Props {
  restaurantId: string;
  onConfigSaved?: () => void;
}
```

### Key Features
- **Toggle Switches:** Enable AVOS, Upselling, Call Recording, SMS Payment
- **Input Fields:** Phone Number (E.164), Transfer Phone
- **Dropdown:** Primary Language (EN/中文/粵語/ES)
- **Multi-select:** Supported Languages (checkboxes)
- **Radio Buttons:** AI Engine (Google Gemini 2.0 / Amazon Nova Sonic)
- **Textareas:** Custom greetings per language
- **Buttons:** Save Configuration, Sync Menu

### API Calls
- `GET /api/avos/config?restaurantId=X` - Fetch on mount
- `POST /api/avos/config` - Save settings
- `POST /api/avos/menu-sync` - Rebuild menu index

### State Management
- Loading state during fetch
- Saving state for submit button
- Syncing state for menu sync
- Toast notifications (success/error)

### UI Elements
- Custom toggle switches (not checkboxes)
- Gradient save button
- Secondary "Sync Menu" button
- Toast notification system

---

## Component 2: AVOSLiveWidget.tsx

### Purpose
Real-time monitoring widget showing active call status and daily summary.

### Props
```typescript
interface Props {
  restaurantId: string;
}
```

### Key Features
- **Polling:** Fetches every 5 seconds
- **Active Call Display:**
  - Pulsing green indicator
  - Masked phone number (***-***-1234)
  - Live duration timer (updates every second)
  - Language badge
  - Dialog state badge
  - Last transcript line
  - Current order items (first 3 + count)
- **No Call Display:**
  - Gray indicator
  - Daily summary: total calls, orders, revenue

### API Calls
- `GET /api/avos/calls?restaurantId=X&status=in_progress&limit=1` - Every 5 seconds

### State Management
- Active call data
- Duration counter (increments every second)
- Loading state
- Auto-polling with cleanup

### UI Elements
- Pulsing animation for active call
- Masked phone display
- Color-coded badges (language, dialog state)
- Gradient cards for call details

---

## Component 3: AVOSCallHistory.tsx

### Purpose
Sortable table showing past calls with expandable transcript viewing.

### Props
```typescript
interface Props {
  restaurantId: string;
}
```

### Key Features
- **Table Columns:** Date/Time, Duration, Language, Items, Total, Status, Actions
- **Status Badges:**
  - Completed (green)
  - Failed (red)
  - Transferred (yellow)
  - In Progress (blue)
- **Expandable Rows:**
  - Full transcript with speaker labels (AI/Customer)
  - Timestamps for each message
  - Ordered items list
- **Filtering:** Date range (7 days, 30 days, all time)
- **Pagination:** "Load More" button shows remaining count
- **Empty State:** Message when no calls exist

### API Calls
- `GET /api/avos/calls?restaurantId=X&limit=20&offset=0&dateRange=7days|30days|all`
- `GET /api/avos/calls/{callId}?restaurantId=X` - Fetch transcript on expand

### State Management
- Calls array
- Expanded call ID (single)
- Loading/loadingMore states
- Date range filter
- Pagination offset

### UI Elements
- Scrollable table
- Expandable row with chevron
- Transcript display with alternating colors
- Status badge styling
- Load more button with count

---

## Component 4: AVOSAnalytics.tsx

### Purpose
Performance analytics dashboard showing metrics, trends, and distributions.

### Props
```typescript
interface Props {
  restaurantId: string;
}
```

### Key Features
- **Time Period Selector:** Today, This Week, This Month, All Time
- **Stat Cards (4 columns):**
  - Total Calls (with trend)
  - Successful Orders (with trend)
  - Average Order Value (with trend)
  - Revenue from AVOS (with trend)
  - Each shows: large number, label, trend arrow, percentage change
- **Popular Items Section:**
  - Top 5 items ordered via AVOS
  - Rank badge (#1, #2, etc.)
  - Count and revenue per item
- **Language Distribution:**
  - Horizontal bar chart (animated)
  - Color-coded: EN (blue), 中文 (red), 粵語 (orange), ES (green)
  - Percentage and count labels

### API Calls
- `GET /api/avos/analytics?restaurantId=X&period=today|week|month|all`

### State Management
- Analytics data
- Time period selection
- Loading state
- Trend calculations (up/down/neutral)

### UI Elements
- Period selector buttons (gradient active state)
- Stat cards with trend icons
- Loading skeletons
- Horizontal bar charts
- Ranked item list

---

## Design Patterns Used

### Dark Theme
- `dark:bg-zinc-900` - Main backgrounds
- `dark:bg-gray-800` - Secondary backgrounds
- `dark:border-gray-700` - Borders
- `dark:text-white` - Primary text
- `dark:text-gray-400` - Secondary text

### Colors
- **Primary:** Purple-600 (`from-purple-600 to-blue-600` gradient)
- **Success:** Green-500 / Green-600
- **Error:** Red-600
- **Warning:** Yellow-600
- **Info:** Blue-600

### Component Styles
- **Cards:** `rounded-lg border border-gray-200 dark:border-gray-700 p-6`
- **Buttons:** `px-4 py-3 rounded-lg transition-all`
- **Inputs:** `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600`
- **Badges:** `px-2 py-1 rounded text-xs font-medium`

### Icons (from lucide-react)
- Phone, PhoneIncoming, Clock, Globe, MessageSquare, DollarSign
- ChevronDown, ChevronUp, Save, RefreshCw, AlertCircle, CheckCircle
- TrendingUp, TrendingDown, BarChart3, Utensils

---

## Integration Checklist

- [ ] Copy all 4 files to `/components/avos/`
- [ ] Import components in dashboard page
- [ ] Verify all API endpoints exist
- [ ] Test dark theme styling
- [ ] Test responsive layout on mobile
- [ ] Configure toast notification system if not exists
- [ ] Set up restaurantId prop from URL/context
- [ ] Test API polling (live widget)
- [ ] Test expandable rows (call history)
- [ ] Test form submission (config panel)

---

## Browser & Performance

- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Bundle Size:** ~51 KB total (uncompressed, with lucide icons)
- **Performance:**
  - Config Panel: Loads config on mount, saves on button click
  - Live Widget: Polls every 5 seconds (not aggressive)
  - Call History: Lazy loads transcripts on expand
  - Analytics: Loads once per period selection
- **Accessibility:** Semantic HTML, keyboard navigation ready

---

## Known Requirements

1. **Environment:** Next.js 14, React 18+, Tailwind CSS, lucide-react
2. **API Base URL:** Components use relative paths (e.g., `/api/avos/...`)
3. **Error Handling:** Console logs + toast notifications
4. **Timestamps:** Components assume ISO 8601 format from API
5. **Internationalization:** Language labels hardcoded (can be externalized)

---

## Development Notes

- All components are **'use client'** (Next.js 14 client components)
- No external state management (Context/Redux) required
- No Supabase direct calls—all via REST API
- Form validation minimal (add as needed)
- Rate limiting: Implement on backend for API calls
- Caching: Consider adding SWR/React Query for better data management
