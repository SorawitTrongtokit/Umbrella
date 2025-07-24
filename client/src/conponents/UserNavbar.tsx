import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function UserNavbar() {
  const [, setLocation] = useLocation();

  const handleBackToHome = () => {
    setLocation('/');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 mb-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <i className="fas fa-user text-green-600 text-xl"></i>
          <h2 className="text-lg font-semibold text-gray-900">โหมดผู้ใช้</h2>
          <Badge variant="outline" className="border-green-300 text-green-600">
            <i className="fas fa-users mr-1"></i>
            นักเรียน/บุคลากร
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <i className="fas fa-home mr-2"></i>
            หน้าแรก
          </Button>
        </div>
      </div>
    </div>
  );
}