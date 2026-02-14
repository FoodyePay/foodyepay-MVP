# AVOS Components - Dashboard Integration Template

Use these code snippets to integrate the 4 AVOS components into your restaurant dashboard page.

---

## Complete Dashboard Example

### File: `app/dashboard/restaurant/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';

export default function RestaurantDashboard() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Restaurant Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your AVOS voice ordering system
          </p>
        </div>
      </div>

      {/* Live Widget - Top Priority */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AVOS Status
        </h2>
        <AVOSLiveWidget restaurantId={restaurantId} />
      </section>

      {/* Analytics - High-level metrics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AVOS Performance
        </h2>
        <AVOSAnalytics restaurantId={restaurantId} />
      </section>

      {/* Configuration & History - Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration (narrower) */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AVOS Configuration
          </h2>
          <AVOSConfigPanel restaurantId={restaurantId} />
        </div>

        {/* Right Column: Call History (wider) */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Call History
          </h2>
          <AVOSCallHistory restaurantId={restaurantId} />
        </div>
      </div>

      {/* Optional: Footer or Additional Sections */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
```

---

## Alternative: Tabbed Layout

If you want a tabbed interface instead of a single-page layout:

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Settings, BarChart3, PhoneIncoming, Clock } from 'lucide-react';
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';

type Tab = 'overview' | 'analytics' | 'calls' | 'settings';

export default function RestaurantDashboard() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <PhoneIncoming className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'calls', label: 'Calls', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AVOS Dashboard
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AVOSLiveWidget restaurantId={restaurantId} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Summary
            </h2>
            <AVOSAnalytics restaurantId={restaurantId} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AVOS Performance Metrics
            </h2>
            <AVOSAnalytics restaurantId={restaurantId} />
          </div>
        )}

        {activeTab === 'calls' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Call History
            </h2>
            <AVOSCallHistory restaurantId={restaurantId} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AVOS Configuration
            </h2>
            <AVOSConfigPanel restaurantId={restaurantId} />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Minimal Integration (Just the Components)

If you already have a dashboard and just want to add the components:

```typescript
// Import
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';

// In your page/component
export default function YourPage() {
  const restaurantId = 'your-restaurant-id';

  return (
    <div className="space-y-6">
      {/* Add where you want */}
      <AVOSLiveWidget restaurantId={restaurantId} />
      <AVOSAnalytics restaurantId={restaurantId} />
      <AVOSCallHistory restaurantId={restaurantId} />
      <AVOSConfigPanel restaurantId={restaurantId} />
    </div>
  );
}
```

---

## With Refresh Function (Config Panel)

If you want to refresh other components when config changes:

```typescript
'use client';

import { useRef } from 'react';
import AVOSConfigPanel from '@/components/avos/AVOSConfigPanel';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSCallHistory from '@/components/avos/AVOSCallHistory';

export default function Dashboard({ restaurantId }: { restaurantId: string }) {
  const liveWidgetRef = useRef<{ refetch?: () => void }>(null);

  const handleConfigSaved = () => {
    // Optionally refresh live widget after config is saved
    console.log('Config saved, optionally refresh components');
    // liveWidgetRef.current?.refetch?.();
  };

  return (
    <div className="space-y-6">
      <AVOSLiveWidget restaurantId={restaurantId} />
      <AVOSConfigPanel
        restaurantId={restaurantId}
        onConfigSaved={handleConfigSaved}
      />
      <AVOSCallHistory restaurantId={restaurantId} />
    </div>
  );
}
```

---

## With Context API (For restaurantId)

If you're using Context to pass `restaurantId`:

```typescript
// Create context
import { createContext, useContext } from 'react';

const RestaurantContext = createContext<string | null>(null);

export function RestaurantProvider({
  restaurantId,
  children,
}: {
  restaurantId: string;
  children: React.ReactNode;
}) {
  return (
    <RestaurantContext.Provider value={restaurantId}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantId() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurantId must be in RestaurantProvider');
  return context;
}

// Usage in component
function MyComponent() {
  const restaurantId = useRestaurantId();
  return <AVOSLiveWidget restaurantId={restaurantId} />;
}
```

---

## Error Boundary (Optional)

Wrap components with error boundary for better error handling:

```typescript
'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class AVOSErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('AVOS component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Failed to load AVOS component. Please refresh the page.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
<AVOSErrorBoundary>
  <AVOSLiveWidget restaurantId={restaurantId} />
</AVOSErrorBoundary>
```

---

## With Loading Skeleton

Show skeleton while loading restaurant data:

```typescript
'use client';

import { useState, useEffect } from 'react';
import AVOSLiveWidget from '@/components/avos/AVOSLiveWidget';
import AVOSAnalytics from '@/components/avos/AVOSAnalytics';

export default function Dashboard() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch or get restaurantId from params/context
    const fetchRestaurantId = async () => {
      // Your logic here
      setRestaurantId('rest_123');
    };
    fetchRestaurantId();
  }, []);

  if (!restaurantId) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <AVOSLiveWidget restaurantId={restaurantId} />
      <AVOSAnalytics restaurantId={restaurantId} />
    </div>
  );
}
```

---

## Responsive Layout Variants

### Mobile-First (Stack vertically)
```typescript
<div className="space-y-4 md:space-y-6">
  <AVOSLiveWidget restaurantId={restaurantId} />
  <AVOSAnalytics restaurantId={restaurantId} />
  <AVOSConfigPanel restaurantId={restaurantId} />
  <AVOSCallHistory restaurantId={restaurantId} />
</div>
```

### Sidebar Layout
```typescript
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Sidebar */}
  <div className="lg:col-span-1 space-y-4">
    <AVOSLiveWidget restaurantId={restaurantId} />
    <AVOSConfigPanel restaurantId={restaurantId} />
  </div>

  {/* Main Content */}
  <div className="lg:col-span-3 space-y-6">
    <AVOSAnalytics restaurantId={restaurantId} />
    <AVOSCallHistory restaurantId={restaurantId} />
  </div>
</div>
```

### Two-Column (Equal Width)
```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="space-y-6">
    <AVOSLiveWidget restaurantId={restaurantId} />
    <AVOSAnalytics restaurantId={restaurantId} />
  </div>
  <div className="space-y-6">
    <AVOSConfigPanel restaurantId={restaurantId} />
    <AVOSCallHistory restaurantId={restaurantId} />
  </div>
</div>
```

---

## Notes on Integration

1. **restaurantId:** Pass as string prop. Get from URL params, context, or state
2. **Dark Mode:** Components auto-support dark mode via Tailwind
3. **Styling:** No custom CSS needed—Tailwind classes handle everything
4. **API Base:** Components use relative paths (`/api/avos/...`)
5. **Polling:** Live Widget polls every 5 seconds automatically
6. **Errors:** Handled internally with toast notifications
7. **Loading:** Skeleton loaders built into components

---

## Checklist Before Deploying

- [ ] Imported all 4 components correctly
- [ ] Passed `restaurantId` prop to each component
- [ ] Verified API endpoints exist in backend
- [ ] Tested in light and dark mode
- [ ] Tested on mobile (responsive)
- [ ] Verified polling interval for Live Widget
- [ ] Set up error boundaries if desired
- [ ] Tested form submission (config panel)
- [ ] Tested expandable rows (call history)
- [ ] Deployed and monitored in production

---

## Support

- **Integration Guide:** `AVOS_INTEGRATION_GUIDE.md`
- **Component Specs:** `AVOS_COMPONENTS_SUMMARY.md`
- **API Shapes:** `AVOS_API_RESPONSE_SHAPES.md`
- **Quick Start:** `AVOS_COMPONENTS_QUICKSTART.md`
