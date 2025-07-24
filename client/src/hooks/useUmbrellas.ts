import { useEffect, useState } from 'react';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Umbrella, Activity } from '@/types/umbrella';

export function useUmbrellas() {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Initialize umbrellas if they don't exist
      const umbrellaRef = ref(database, 'umbrellas');
      const activitiesRef = ref(database, 'activities');

      const unsubscribeUmbrellas = onValue(umbrellaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const umbrellaArray = Object.values(data) as Umbrella[];
          setUmbrellas(umbrellaArray);
        } else {
          // Initialize 21 umbrellas
          const initialUmbrellas: { [key: string]: Umbrella } = {};
          for (let i = 1; i <= 21; i++) {
            initialUmbrellas[i] = {
              id: i,
              status: 'available'
            };
          }
          set(umbrellaRef, initialUmbrellas);
          setUmbrellas(Object.values(initialUmbrellas));
        }
        setLoading(false);
      }, (error) => {
        setError('ไม่สามารถโหลดข้อมูลร่มได้: ' + error.message);
        setLoading(false);
      });

      const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const activityArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...(value as Omit<Activity, 'id'>)
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivities(activityArray.slice(0, 10)); // Keep only latest 10
        }
      });

      return () => {
        unsubscribeUmbrellas();
        unsubscribeActivities();
      };
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
      setLoading(false);
    }
  }, []);

  const borrowUmbrella = async (umbrellaId: number, borrower: string, phone: string, location: string): Promise<boolean> => {
    try {
      const umbrellaRef = ref(database, `umbrellas/${umbrellaId}`);
      const activitiesRef = ref(database, 'activities');
      
      const now = new Date().toISOString();
      
      await set(umbrellaRef, {
        id: umbrellaId,
        status: 'borrowed',
        borrower,
        borrowerPhone: phone,
        borrowLocation: location,
        borrowedAt: now
      });

      await push(activitiesRef, {
        type: 'borrow',
        umbrellaId,
        borrower,
        location,
        timestamp: now
      });

      return true;
    } catch (err) {
      setError('ไม่สามารถยืมร่มได้: ' + (err as Error).message);
      return false;
    }
  };

  const returnUmbrella = async (umbrellaId: number, location: string): Promise<boolean> => {
    try {
      const umbrella = umbrellas.find(u => u.id === umbrellaId);
      if (!umbrella || umbrella.status !== 'borrowed') {
        setError('ไม่พบร่มที่ถูกยืมไป');
        return false;
      }

      const umbrellaRef = ref(database, `umbrellas/${umbrellaId}`);
      const activitiesRef = ref(database, 'activities');
      
      const now = new Date().toISOString();
      
      await set(umbrellaRef, {
        id: umbrellaId,
        status: 'available',
        returnLocation: location,
        returnedAt: now
      });

      await push(activitiesRef, {
        type: 'return',
        umbrellaId,
        borrower: umbrella.borrower || 'ไม่ทราบชื่อ',
        location,
        timestamp: now
      });

      return true;
    } catch (err) {
      setError('ไม่สามารถคืนร่มได้: ' + (err as Error).message);
      return false;
    }
  };

  const getAvailableUmbrellas = () => {
    return umbrellas.filter(u => u.status === 'available');
  };

  const getBorrowedUmbrellas = () => {
    return umbrellas.filter(u => u.status === 'borrowed');
  };

  const getStats = () => {
    return {
      available: umbrellas.filter(u => u.status === 'available').length,
      borrowed: umbrellas.filter(u => u.status === 'borrowed').length,
      total: umbrellas.length
    };
  };

  return {
    umbrellas,
    activities,
    loading,
    error,
    borrowUmbrella,
    returnUmbrella,
    getAvailableUmbrellas,
    getBorrowedUmbrellas,
    getStats,
    clearError: () => setError(null)
  };
}
