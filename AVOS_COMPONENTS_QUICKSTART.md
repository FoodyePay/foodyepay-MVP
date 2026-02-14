# AVOS Components - Quick Start Guide

## What You Got (4 Components)

| File | Lines | Purpose | Polling |
|------|-------|---------|---------|
| `AVOSConfigPanel.tsx` | 428 | Restaurant settings (enable, phone, language, AI engine) | No |
| `AVOSLiveWidget.tsx` | 254 | Real-time call monitor (pulsing, duration timer, transcript) | Every 5s |
| `AVOSCallHistory.tsx` | 390 | Call history table with expandable transcripts | No |
| `AVOSAnalytics.tsx` | 336 | Metrics dashboard (stats, top items, language distribution) | No |

**Total:** 1,408 lines of React code

---

## One-Minute Integration

### 1. Copy Files
```bash
# All 4 components are in: /components/avos/
# Ready to import
```

### 2. Import & Use
```typescript
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';

export default function DashboardPage({ restaurantId }: Props) {
  return (
    <div className="space-y-6 p-6">
      <AVOSLiveWidget restaurantId={restaurantId} />
      <AVOSAnalytics restaurantId={restaurantId} />
      <div className="grid grid-cols-3 gap-6">
        <AVOSConfigPanel restaurantId={restaurantId} />
        <div className="col-span-2">
          <AVOSCallHistory restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
}
```

### 3. Verify API Endpoints
```
GET  /api/avos/config?restaurantId=X
POST /api/avos/config
POST /api/avos/menu-sync
GET  /api/avos/calls?restaurantId=X&status=in_progress&limit=1
GET  /api/avos/calls?restaurantId=X&limit=20&offset=0&dateRange=7days
GET  /api/avos/calls/{callId}?restaurantId=X
GET  /api/avos/analytics?restaurantId=X&period=week
```

Done! ✓

---

## Component Quick Ref

### AVOSConfigPanel
```typescript
// Props
{ restaurantId: string; onConfigSaved?: () => void }

// What it does
- Toggle AVOS on/off
- Set phone number (E.164)
- Choose AI engine (Gemini 2.0 or Nova Sonic)
- Enable/disable: upselling, recording, SMS payment
- Set languages & custom greetings
- Save button → POST to /api/avos/config
- Sync menu button → POST to /api/avos/menu-sync

// Features
- Form with toggle switches, dropdowns, multi-select
- Toast notifications on success/error
- Loading states during save/sync
```

### AVOSLiveWidget
```typescript
// Props
{ restaurantId: string }

// What it does
- Shows active call (if any) with:
  - Pulsing green indicator
  - Masked phone: ***-***-1234
  - Live timer (updates every 1s)
  - Language badge
  - Dialog state
  - Last transcript line
  - Current items being ordered
- Shows daily summary if no active call:
  - Total calls, orders, revenue

// Features
- Polls /api/avos/calls every 5 seconds
- Auto-updates timer
- Compact card design (good for dashboard sidebar)
```

### AVOSCallHistory
```typescript
// Props
{ restaurantId: string }

// What it does
- Table of past calls (date, duration, language, items, total, status)
- Status badges: completed, failed, transferred, in_progress
- Click row to expand → shows full transcript
- Transcript has timestamps and speaker labels (AI/Customer)
- Filter by date range: 7 days, 30 days, all time
- "Load More" pagination

// Features
- Lazy-loads transcripts on expand
- Responsive table
- Empty state message
- Shows "X of Y" calls
```

### AVOSAnalytics
```typescript
// Props
{ restaurantId: string }

// What it does
- 4 stat cards: Total Calls, Successful Orders, Avg Order Value, Revenue
  - Each shows trend (up/down) with % change
- Top 5 items ordered (name, count, revenue)
- Language distribution bar chart (EN/中文/粵語/ES)
- Time period selector: Today, This Week, This Month, All Time

// Features
- Loads analytics on period change
- Animated bars
- Loading skeletons
- Trend calculations
```

---

## Style Patterns Used

### All components follow:
- Dark theme: `dark:bg-zinc-900`, `dark:text-white`, `dark:border-gray-700`
- Gradient buttons: `from-purple-600 to-blue-600`
- Status badges: `bg-green-100 dark:bg-green-900`
- Icons from `lucide-react`
- Tailwind CSS (no CSS files needed)
- `'use client'` directive (Next.js 14)

### Example badge:
```jsx
<span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
  Completed
</span>
```

---

## Expected Data Flows

```
┌─────────────────────────────────────────────────────────┐
│           Restaurant Dashboard Page                     │
└────────┬────────────────────────────────────────────────┘
         │ restaurantId prop
    ┌────┴────────────────────────────────────────┐
    │                                             │
┌───▼──────────────┐  ┌──────────────┐  ┌────────▼────────┐
│ AVOSConfigPanel  │  │ AVOSLiveWidget │  │ AVOSAnalytics  │
│                  │  │                │  │                │
│ POST /api/avos/  │  │ GET /api/avos/ │  │ GET /api/avos/ │
│ config           │  │ calls (5s poll)│  │ analytics      │
│ POST /api/avos/  │  │ (real-time)    │  │ (on period     │
│ menu-sync        │  │                │  │ change)        │
└──────────────────┘  └──────────────┘  └────────────────┘

         ┌───────────────────────────────────────┐
         │                                       │
    ┌────▼──────────────────┐                   │
    │ AVOSCallHistory       │                   │
    │                       │                   │
    │ GET /api/avos/calls   │                   │
    │ (pagination)          │                   │
    │ GET /api/avos/calls   │                   │
    │ /{id} (on expand)     │                   │
    └───────────────────────┘                   │
                                                │
                                    All feed into
                                   same API server
```

---

## Common Customizations

### Change gradient colors
```jsx
// From purple-blue
className="bg-gradient-to-r from-purple-600 to-blue-600"

// To your brand color
className="bg-gradient-to-r from-[#222c4e] to-[#454b80]"
```

### Change polling interval
```typescript
// In AVOSLiveWidget.tsx, change line ~40
const interval = setInterval(fetchData, 5000); // Change 5000 (5s)
```

### Add loading skeleton
```jsx
if (loading) {
  return (
    <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
  );
}
```

### Change empty state message
```jsx
<p className="text-gray-500 dark:text-gray-400">
  Your custom message here
</p>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Components not showing | Check `restaurantId` prop is passed |
| API calls failing | Verify endpoints exist in `/api/avos/...` |
| Dark theme not working | Ensure `dark:` classes in Tailwind config |
| Polling not working | Check Live Widget polling (5s interval) |
| Icons not showing | Verify `lucide-react` is installed |
| Form not submitting | Check API endpoint responds with 200 |
| Toast not showing | Verify toast system in top-right works |

---

## Performance Tips

1. **Polling:** Live Widget polls every 5s—adjust if needed
2. **Transcripts:** Call History lazy-loads transcripts on expand
3. **Analytics:** Consider adding SWR/React Query for caching
4. **Images:** Optimize any restaurant images served with calls
5. **Bundle:** Components total ~51KB uncompressed

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

All components are fully responsive.

---

## File Manifest

### Components (Ready to Use)
```
components/avos/
├── AVOSConfigPanel.tsx       ✓ Configuration settings
├── AVOSLiveWidget.tsx        ✓ Real-time monitoring
├── AVOSCallHistory.tsx       ✓ Call history table
└── AVOSAnalytics.tsx         ✓ Performance dashboard
```

### Documentation (For Reference)
```
AVOS_INTEGRATION_GUIDE.md       ← Start here
AVOS_COMPONENTS_SUMMARY.md      ← Component details
AVOS_API_RESPONSE_SHAPES.md     ← API contracts
AVOS_COMPONENTS_QUICKSTART.md   ← You are here
(other AVOS_*.md files from previous work)
```

---

## Next Steps

1. ✓ Review 4 components in `/components/avos/`
2. ✓ Import into dashboard page
3. ✓ Verify API endpoints exist
4. ✓ Test with real `restaurantId`
5. ✓ Customize styling if needed
6. ✓ Deploy and monitor

---

**Questions?** Check the docs:
- Integration: `AVOS_INTEGRATION_GUIDE.md`
- API shapes: `AVOS_API_RESPONSE_SHAPES.md`
- Details: `AVOS_COMPONENTS_SUMMARY.md`
