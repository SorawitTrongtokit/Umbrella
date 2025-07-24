import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Memoized umbrella grid component for better performance
export const UmbrellaGrid = memo(({ umbrellas, onUmbrellaClick }: {
  umbrellas: any[];
  onUmbrellaClick?: (id: number) => void;
}) => {
  const umbrellaItems = useMemo(() => {
    return umbrellas.map((umbrella) => (
      <div
        key={umbrella.id}
        onClick={() => onUmbrellaClick?.(umbrella.id)}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md
          ${umbrella.status === 'available' 
            ? 'bg-green-50 border-green-200 hover:border-green-300' 
            : 'bg-red-50 border-red-200 hover:border-red-300'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">#{umbrella.id}</span>
          <i className={`fas fa-umbrella text-xl ${
            umbrella.status === 'available' ? 'text-green-600' : 'text-red-600'
          }`}></i>
        </div>
        <p className={`text-sm mt-1 font-medium ${
          umbrella.status === 'available' ? 'text-green-700' : 'text-red-700'
        }`}>
          {umbrella.status === 'available' ? 'ว่าง' : 'ถูกยืม'}
        </p>
        {umbrella.borrower && (
          <p className="text-xs text-gray-600 mt-1 truncate">
            ผู้ยืม: {umbrella.borrower}
          </p>
        )}
      </div>
    ));
  }, [umbrellas, onUmbrellaClick]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
      {umbrellaItems}
    </div>
  );
});

UmbrellaGrid.displayName = 'UmbrellaGrid';

// Optimized activity list component
export const ActivityList = memo(({ activities, limit = 10 }: {
  activities: any[];
  limit?: number;
}) => {
  const recentActivities = useMemo(() => {
    return activities.slice(0, limit);
  }, [activities, limit]);

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {recentActivities.map((activity) => (
        <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              activity.type === 'borrow' ? 'bg-orange-500' : 'bg-green-500'
            }`}></div>
            <div>
              <p className="font-medium text-sm">
                {activity.type === 'borrow' ? 'ยืม' : 'คืน'} ร่ม #{activity.umbrellaNumber}
              </p>
              <p className="text-xs text-gray-600">
                {activity.borrower} • {activity.location}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(activity.timestamp).toLocaleTimeString('th-TH')}
          </p>
        </div>
      ))}
    </div>
  );
});

ActivityList.displayName = 'ActivityList';

// Performance monitoring component
export const PerformanceMonitor = memo(() => {
  const performanceMetrics = useMemo(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as any;
      return {
        loadTime: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart) || 0,
        domReady: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart) || 0,
        ttfb: Math.round(navigation?.responseStart - navigation?.requestStart) || 0,
      };
    }
    return null;
  }, []);

  if (!performanceMetrics) return null;

  return (
    <Card className="mt-4 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm flex items-center">
          <i className="fas fa-tachometer-alt mr-2 text-blue-600"></i>
          ประสิทธิภาพระบบ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <p className="font-bold text-lg text-blue-600">{performanceMetrics.loadTime}ms</p>
            <p className="text-gray-600">เวลาโหลด</p>
          </div>
          <div>
            <p className="font-bold text-lg text-green-600">{performanceMetrics.domReady}ms</p>
            <p className="text-gray-600">DOM พร้อม</p>
          </div>
          <div>
            <p className="font-bold text-lg text-purple-600">{performanceMetrics.ttfb}ms</p>
            <p className="text-gray-600">TTFB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';