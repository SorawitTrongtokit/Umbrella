import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { toast } = useToast();

  // Simple admin password (in production, use proper authentication)
  const ADMIN_PASSWORD = 'umbrella2024';

  const handleUserAccess = () => {
    setLocation('/user');
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      // Store admin session (simple local storage)
      localStorage.setItem('isAdmin', 'true');
      setLocation('/admin');
    } else {
      toast({
        title: "รหัสผ่านไม่ถูกต้อง",
        description: "กรุณาตรวจสอบรหัสผ่านแอดมินอีกครั้ง",
        variant: "destructive"
      });
      setAdminPassword('');
    }
  };

  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-6 mx-auto mb-4 shadow-lg w-20 h-20 flex items-center justify-center">
            <i className="fas fa-umbrella text-3xl text-primary"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ระบบยืม-คืนร่ม
          </h1>
          <p className="text-gray-600">เลือกประเภทการเข้าใช้งาน</p>
        </div>

        {!showAdminLogin ? (
          <div className="space-y-4">
            {/* User Access Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary cursor-pointer" onClick={handleUserAccess}>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-user mr-3"></i>
                  สำหรับผู้ใช้ทั่วไป
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-hand-holding text-green-600 mr-3"></i>
                    <span>ยืมร่ม</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-undo text-blue-600 mr-3"></i>
                    <span>คืนร่ม</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-list-ul text-purple-600 mr-3"></i>
                    <span>ดูสถานะร่ม</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-qrcode text-orange-600 mr-3"></i>
                    <span>สแกน QR Code</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  เข้าใช้งานทันที
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </CardContent>
            </Card>

            {/* Admin Access Card */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-red-500 cursor-pointer" onClick={handleAdminAccess}>
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-user-shield mr-3"></i>
                  สำหรับผู้ดูแลระบบ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-chart-bar text-blue-600 mr-3"></i>
                    <span>ดูสถิติการใช้งาน</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-database text-green-600 mr-3"></i>
                    <span>จัดการฐานข้อมูล</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-history text-purple-600 mr-3"></i>
                    <span>ประวัติการใช้งาน</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-tools text-orange-600 mr-3"></i>
                    <span>เครื่องมือแอดมิน</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                  เข้าสู่ระบบแอดมิน
                  <i className="fas fa-lock ml-2"></i>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Admin Login Form */
          <Card className="shadow-xl border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <i className="fas fa-shield-alt mr-3"></i>
                เข้าสู่ระบบแอดมิน
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-600 text-lg mr-3 mt-1"></i>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">เฉพาะผู้ดูแลระบบ</h3>
                    <p className="text-xs text-yellow-700 mt-1">
                      ต้องมีรหัสผ่านแอดมินเท่านั้น
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">รหัสผ่านแอดมิน</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านแอดมิน"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="border-red-200 focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowAdminLogin(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={handleAdminLogin}
                  disabled={!adminPassword}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  เข้าสู่ระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>ระบบยืม-คืนร่มโรงเรียน</p>
          <p className="text-xs mt-1">พัฒนาด้วย React + Firebase</p>
        </div>
      </div>
    </div>
  );
}