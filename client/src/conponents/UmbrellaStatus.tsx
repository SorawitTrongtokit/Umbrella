import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUmbrellas } from '@/hooks/useUmbrellas';

export default function UmbrellaStatus() {
  const { umbrellas, activities, loading, getStats } = useUmbrellas();
  
  const stats = getStats();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} วันที่แล้ว`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center">
                <i className="fas fa-chart-bar mr-3"></i>
                สถานะร่มทั้งหมด
              </CardTitle>
              <p className="text-purple-100 text-sm mt-1">ข้อมูลแบบ Real-time</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stats.available}</div>
              <div className="text-purple-100 text-xs">ร่มว่าง / {stats.total}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Status Summary */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.available}</div>
                <div className="text-sm text-emerald-700">ว่าง</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.borrowed}</div>
                <div className="text-sm text-red-700">ถูกยืม</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                <div className="text-sm text-gray-700">ทั้งหมด</div>
              </div>
            </div>
          </div>

          {/* Umbrella Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {umbrellas.map((umbrella) => (
                <div
                  key={umbrella.id}
                  className={`${
                    umbrella.status === 'available'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  } border-2 rounded-lg p-3 text-center transition-all hover:shadow-md`}
                >
                  <div className={`${
                    umbrella.status === 'available' 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  } text-2xl mb-2`}>
                    <i className="fas fa-umbrella"></i>
                  </div>
                  <div className={`font-bold ${
                    umbrella.status === 'available' 
                      ? 'text-emerald-800' 
                      : 'text-red-800'
                  }`}>
                    #{umbrella.id}
                  </div>
                  <div className={`text-xs mt-1 ${
                    umbrella.status === 'available' 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {umbrella.status === 'available' ? 'ว่าง' : umbrella.borrower}
                  </div>
                  {umbrella.status === 'borrowed' && umbrella.borrowLocation && (
                    <div className="text-xs text-red-500">
                      {umbrella.borrowLocation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  ยังไม่มีกิจกรรม
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${
                        activity.type === 'return' 
                          ? 'bg-emerald-100' 
                          : 'bg-blue-100'
                      } rounded-full flex items-center justify-center`}>
                        <i className={`fas ${
                          activity.type === 'return' 
                            ? 'fa-undo text-emerald-600' 
                            : 'fa-plus text-blue-600'
                        } text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'return' ? 'คืน' : 'ยืม'}ร่ม #{activity.umbrellaId}
                        </p>
                        <p className="text-xs text-gray-500">
                          โดย: {activity.borrower} ที่ {activity.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
