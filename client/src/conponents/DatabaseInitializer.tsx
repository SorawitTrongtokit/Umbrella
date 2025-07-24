import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Umbrella } from '@/types/umbrella';
import { usePostgresInitialize, usePostgresReset } from '@/lib/database';

export default function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<'firebase' | 'postgres'>('firebase');
  const { toast } = useToast();
  
  const postgresInitialize = usePostgresInitialize();
  const postgresReset = usePostgresReset();

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      
      if (selectedDatabase === 'firebase') {
        // Create initial umbrellas data for Firebase
        const initialUmbrellas: { [key: string]: Umbrella } = {};
        for (let i = 1; i <= 21; i++) {
          initialUmbrellas[i] = {
            id: i,
            status: 'available'
          };
        }

        // Set the data in Firebase
        const umbrellaRef = ref(database, 'umbrellas');
        await set(umbrellaRef, initialUmbrellas);
        
        toast({
          title: "สำเร็จ!",
          description: "สร้างร่มทั้ง 21 คันใน Firebase เรียบร้อยแล้ว",
          variant: "default"
        });
      } else {
        // Initialize PostgreSQL database
        await postgresInitialize.mutateAsync();
        
        toast({
          title: "สำเร็จ!",
          description: "สร้างร่มทั้ง 21 คันใน PostgreSQL เรียบร้อยแล้ว",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างข้อมูลร่มได้: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const resetDatabase = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    try {
      setIsInitializing(true);
      
      if (selectedDatabase === 'firebase') {
        // Reset all umbrellas to available
        const initialUmbrellas: { [key: string]: Umbrella } = {};
        for (let i = 1; i <= 21; i++) {
          initialUmbrellas[i] = {
            id: i,
            status: 'available'
          };
        }

        // Clear activities and reset umbrellas
        const umbrellaRef = ref(database, 'umbrellas');
        const activitiesRef = ref(database, 'activities');
        
        await Promise.all([
          set(umbrellaRef, initialUmbrellas),
          set(activitiesRef, null)
        ]);

        toast({
          title: "สำเร็จ!",
          description: "รีเซ็ตข้อมูล Firebase ทั้งหมดเรียบร้อยแล้ว",
          variant: "default"
        });
      } else {
        // Reset PostgreSQL database
        await postgresReset.mutateAsync();
        
        toast({
          title: "สำเร็จ!",
          description: "รีเซ็ตข้อมูล PostgreSQL ทั้งหมดเรียบร้อยแล้ว",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error resetting database:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตข้อมูลได้: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <CardTitle className="text-xl font-semibold flex items-center">
          <i className="fas fa-database mr-3"></i>
          จัดการฐานข้อมูล
        </CardTitle>
        <p className="text-orange-100 text-sm">สำหรับผู้ดูแลระบบเท่านั้น</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-600 text-lg mr-3 mt-1"></i>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">คำเตือน</h3>
              <p className="text-xs text-yellow-700 mt-1">
                การกระทำเหล่านี้จะส่งผลต่อข้อมูลในฐานข้อมูลจริง กรุณาใช้ความระมัดระวัง
              </p>
            </div>
          </div>
        </div>

        {/* Database Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">เลือกฐานข้อมูล</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedDatabase('firebase')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-all ${
                selectedDatabase === 'firebase'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-fire mr-2"></i>
              Firebase Realtime
            </button>
            <button
              onClick={() => setSelectedDatabase('postgres')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-all ${
                selectedDatabase === 'postgres'
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <i className="fas fa-database mr-2"></i>
              PostgreSQL
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedDatabase === 'firebase' 
              ? 'ระบบแบบ Real-time สำหรับการอัพเดททันที' 
              : 'ฐานข้อมูลเชิงสัมพันธ์ที่มีประสิทธิภาพสูง'
            }
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={initializeDatabase}
            disabled={isInitializing}
            className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <i className="fas fa-plus mr-2"></i>
            {isInitializing ? 'กำลังสร้างข้อมูล...' : 'สร้างร่ม 21 คันในฐานข้อมูล'}
          </Button>

          <Button 
            onClick={resetDatabase}
            disabled={isInitializing}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <i className="fas fa-trash-restore mr-2"></i>
            {isInitializing ? 'กำลังรีเซ็ต...' : 'รีเซ็ตข้อมูลทั้งหมด'}
          </Button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">ข้อมูลที่จะสร้าง:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• ร่ม 21 คัน (หมายเลข 1-21)</li>
            <li>• สถานะเริ่มต้น: ว่าง (available)</li>
            <li>• พร้อมใช้งานระบบยืม-คืนทันที</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}