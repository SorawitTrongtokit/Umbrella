import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminNavbar() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setLocation('/');
  };

  const handleBackToUser = () => {
    setLocation('/user');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 mb-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-user-shield text-red-600 text-xl"></i>
          <h2 className="text-lg font-semibold text-gray-900">โหมดแอดมิน</h2>
          <Badge variant="destructive">
            <i className="fas fa-lock mr-1"></i>
            ผู้ดูแลระบบ
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBackToUser}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <i className="fas fa-user mr-2"></i>
            โหมดผู้ใช้
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}