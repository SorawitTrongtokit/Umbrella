import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useOptimizedUmbrellas } from '@/hooks/useOptimizedUmbrellas';
import UmbrellaStatus from '@/components/UmbrellaStatus';
import DatabaseInitializer from '@/components/DatabaseInitializer';
import AdminNavbar from '@/components/AdminNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: number;
  type: 'borrow' | 'return';
  umbrellaNumber: number;
  borrower: string;
  location: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { 
    umbrellas, 
    activities, 
    stats, 
    loading: isLoadingUmbrellas 
  } = useOptimizedUmbrellas();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Statistics calculations (using optimized stats from hook)
  const totalUmbrellas = 21;
  const availableCount = stats.available;
  const borrowedCount = stats.borrowed;
  const utilizationRate = stats.utilizationRate;

  // Recent activities (last 10)
  const recentActivities = activities?.slice(-10).reverse() || [];

  // Daily statistics
  const today = new Date().toDateString();
  const todayActivities = activities?.filter(a => 
    new Date(a.timestamp).toDateString() === today
  ) || [];
  const todayBorrows = todayActivities.filter(a => a.type === 'borrow').length;
  const todayReturns = todayActivities.filter(a => a.type === 'return').length;

  if (isLoadingUmbrellas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลแอดมิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <i className="fas fa-user-shield text-red-600 mr-3"></i>
            แอดมินระบบร่ม
          </h1>
          <p className="text-gray-600">จัดการและติดตามระบบยืม-คืนร่ม</p>
          <Badge variant="destructive" className="mt-2">
            <i className="fas fa-lock mr-1"></i>
            เฉพาะผู้ดูแลระบบ
          </Badge>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <i className="fas fa-umbrella text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">ร่มทั้งหมด</h3>
                  <p className="text-2xl font-bold text-blue-900">{totalUmbrellas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">ร่มว่าง</h3>
                  <p className="text-2xl font-bold text-green-900">{availableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-full mr-4">
                  <i className="fas fa-user-clock text-orange-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-orange-800">ถูกยืม</h3>
                  <p className="text-2xl font-bold text-orange-900">{borrowedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-800">อัตราการใช้</h3>
                  <p className="text-2xl font-bold text-purple-900">{utilizationRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <Card className="mb-8 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-yellow-800">
              <i className="fas fa-calendar-day mr-2"></i>
              สรุปวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{todayBorrows}</p>
                <p className="text-sm text-gray-600">ครั้งที่ยืม</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{todayReturns}</p>
                <p className="text-sm text-gray-600">ครั้งที่คืน</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{todayActivities.length}</p>
                <p className="text-sm text-gray-600">กิจกรรมทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow-sm border">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <i className="fas fa-chart-bar mr-2"></i>
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger 
              value="umbrellas"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <i className="fas fa-umbrella mr-2"></i>
              จัดการร่ม
            </TabsTrigger>
            <TabsTrigger 
              value="activities"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <i className="fas fa-history mr-2"></i>
              ประวัติการใช้
            </TabsTrigger>
            <TabsTrigger 
              value="database"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              <i className="fas fa-database mr-2"></i>
              ฐานข้อมูล
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-info-circle mr-2 text-blue-600"></i>
                    สถานะปัจจุบัน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UmbrellaStatus />
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-clock mr-2 text-green-600"></i>
                    กิจกรรมล่าสุด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentActivities.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">ยังไม่มีกิจกรรม</p>
                    ) : (
                      recentActivities.map((activity) => (
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
                            {new Date(activity.timestamp).toLocaleString('th-TH')}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="umbrellas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-umbrella mr-2 text-purple-600"></i>
                  จัดการร่มทั้งหมด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UmbrellaStatus />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <i className="fas fa-history mr-2 text-indigo-600"></i>
                    ประวัติการใช้งานทั้งหมด
                  </span>
                  <Badge variant="outline">
                    {activities?.length || 0} กิจกรรม
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activities?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีประวัติการใช้งาน</p>
                  ) : (
                    activities?.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            activity.type === 'borrow' ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">
                              {activity.type === 'borrow' ? 'ยืม' : 'คืน'} ร่ม #{activity.umbrellaNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              ผู้ใช้: {activity.borrower} • สถานที่: {activity.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString('th-TH')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleTimeString('th-TH')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <DatabaseInitializer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}