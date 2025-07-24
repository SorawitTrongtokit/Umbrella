import { useUmbrellas } from '@/hooks/useUmbrellas';
import FormBorrow from '@/components/FormBorrow';
import FormReturn from '@/components/FormReturn';
import UmbrellaStatus from '@/components/UmbrellaStatus';
import UserNavbar from '@/components/UserNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserDashboard() {
  const { umbrellas, loading } = useUmbrellas();
  
  // Count available and borrowed umbrellas
  const availableCount = umbrellas?.filter((u: any) => u.status === 'available').length || 0;
  const borrowedCount = umbrellas?.filter((u: any) => u.status === 'borrowed').length || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UserNavbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <i className="fas fa-umbrella text-primary mr-3"></i>
            ระบบยืม-คืนร่ม
          </h1>
          <p className="text-gray-600">สำหรับนักเรียนและบุคลากร</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">ร่มที่ว่าง</h3>
                  <p className="text-2xl font-bold text-green-900">{availableCount} คัน</p>
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
                  <h3 className="text-lg font-semibold text-orange-800">ร่มที่ถูกยืม</h3>
                  <p className="text-2xl font-bold text-orange-900">{borrowedCount} คัน</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="borrow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg shadow-sm border">
            <TabsTrigger 
              value="borrow" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <i className="fas fa-hand-holding mr-2"></i>
              ยืมร่ม
            </TabsTrigger>
            <TabsTrigger 
              value="return"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <i className="fas fa-undo mr-2"></i>
              คืนร่ม
            </TabsTrigger>
            <TabsTrigger 
              value="status"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <i className="fas fa-list-ul mr-2"></i>
              สถานะร่ม
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrow" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-hand-holding mr-3"></i>
                  ยืมร่ม
                </CardTitle>
                <p className="text-green-100 text-sm">กรอกข้อมูลเพื่อยืมร่ม</p>
              </CardHeader>
              <CardContent className="p-0">
                <FormBorrow />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="return" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-undo mr-3"></i>
                  คืนร่ม
                </CardTitle>
                <p className="text-blue-100 text-sm">เลือกร่มที่ต้องการคืน</p>
              </CardHeader>
              <CardContent className="p-0">
                <FormReturn />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-list-ul mr-3"></i>
                  สถานะร่มทั้งหมด
                </CardTitle>
                <p className="text-purple-100 text-sm">ดูสถานะร่มแบบ Real-time</p>
              </CardHeader>
              <CardContent className="p-0">
                <UmbrellaStatus />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <i className="fas fa-lightbulb text-blue-600 mr-2"></i>
              คำแนะนำการใช้งาน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-blue-600 mt-1 mr-2"></i>
                <span>สแกน QR Code ที่ร่มเพื่อความสะดวกในการยืม-คืน</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-phone text-blue-600 mt-1 mr-2"></i>
                <span>ระบุเบอร์โทรศัพท์ที่ติดต่อได้เพื่อความปลอดภัย</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-blue-600 mt-1 mr-2"></i>
                <span>เลือกสถานที่ยืม-คืนให้ถูกต้องเพื่อง่ายต่อการติดตาม</span>
              </div>
              <div className="flex items-start">
                <i className="fas fa-clock text-blue-600 mt-1 mr-2"></i>
                <span>สถานะร่มจะอัปเดตแบบ Real-time ทันที</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}