// Client-side Firebase implementation for umbrella system
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  query, 
  orderByChild, 
  limitToLast,
  remove,
  onValue,
  off
} from 'firebase/database';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyDGpRGcKcHgWHfBJHKV-I-9jF_rG5K8g6Y",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "umbrella-system-c3e4c.firebaseapp.com",
  databaseURL: import.meta.env?.VITE_FIREBASE_DATABASE_URL || "https://umbrella-system-c3e4c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "umbrella-system-c3e4c",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "umbrella-system-c3e4c.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdefghijk123456"
};

// Initialize Firebase (check if already initialized)
import { getApps, getApp } from 'firebase/app';

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const database = getDatabase(app);

export interface Umbrella {
  id: number;
  umbrellaNumber: number;
  status: 'available' | 'borrowed';
  borrower?: string;
  borrowerPhone?: string;
  borrowLocation?: string;
  borrowedAt?: Date;
  returnLocation?: string;
  returnedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Activity {
  id: string;
  type: 'borrow' | 'return';
  umbrellaNumber: number;
  borrower: string;
  location: string;
  timestamp: Date;
}

class FirebaseClient {
  // Umbrella methods
  async getAllUmbrellas(): Promise<Umbrella[]> {
    const umbrellasRef = ref(database, 'umbrellas');
    const snapshot = await get(umbrellasRef);
    
    if (!snapshot.exists()) {
      await this.initializeAllUmbrellas();
      return this.getAllUmbrellas();
    }
    
    const umbrellas: Umbrella[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      umbrellas.push({
        id: parseInt(child.key!),
        ...data,
        borrowedAt: data.borrowedAt ? new Date(data.borrowedAt) : undefined,
        returnedAt: data.returnedAt ? new Date(data.returnedAt) : undefined,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      });
    });
    
    return umbrellas.sort((a, b) => a.umbrellaNumber - b.umbrellaNumber);
  }

  async getUmbrellaByNumber(umbrellaNumber: number): Promise<Umbrella | undefined> {
    const umbrellaRef = ref(database, `umbrellas/${umbrellaNumber}`);
    const snapshot = await get(umbrellaRef);
    
    if (!snapshot.exists()) {
      return undefined;
    }
    
    const data = snapshot.val();
    return {
      id: umbrellaNumber,
      ...data,
      borrowedAt: data.borrowedAt ? new Date(data.borrowedAt) : undefined,
      returnedAt: data.returnedAt ? new Date(data.returnedAt) : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  async updateUmbrella(umbrellaNumber: number, data: Partial<Umbrella>): Promise<Umbrella> {
    const umbrellaRef = ref(database, `umbrellas/${umbrellaNumber}`);
    const currentUmbrella = await this.getUmbrellaByNumber(umbrellaNumber);
    
    if (!currentUmbrella) {
      throw new Error(`Umbrella ${umbrellaNumber} not found`);
    }
    
    const updateData = {
      ...currentUmbrella,
      ...data,
      updatedAt: new Date().toISOString(),
      borrowedAt: data.borrowedAt?.toISOString() || currentUmbrella.borrowedAt?.toISOString(),
      returnedAt: data.returnedAt?.toISOString() || currentUmbrella.returnedAt?.toISOString(),
    };
    
    // Clean up undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    await set(umbrellaRef, updateData);
    return { ...currentUmbrella, ...data };
  }

  async borrowUmbrella(
    umbrellaNumber: number, 
    borrower: string, 
    borrowerPhone: string, 
    borrowLocation: string
  ): Promise<void> {
    const now = new Date();
    
    // Update umbrella status
    await this.updateUmbrella(umbrellaNumber, {
      status: 'borrowed',
      borrower,
      borrowerPhone,
      borrowLocation,
      borrowedAt: now,
      returnLocation: undefined,
      returnedAt: undefined,
    });
    
    // Create activity record
    await this.createActivity({
      type: 'borrow',
      umbrellaNumber,
      borrower,
      location: borrowLocation,
    });
  }

  async returnUmbrella(umbrellaNumber: number, returnLocation: string): Promise<void> {
    const umbrella = await this.getUmbrellaByNumber(umbrellaNumber);
    if (!umbrella || umbrella.status !== 'borrowed') {
      throw new Error('Umbrella is not currently borrowed');
    }
    
    const now = new Date();
    
    // Update umbrella status
    await this.updateUmbrella(umbrellaNumber, {
      status: 'available',
      returnLocation,
      returnedAt: now,
      borrower: undefined,
      borrowerPhone: undefined,
      borrowLocation: undefined,
      borrowedAt: undefined,
    });
    
    // Create activity record
    await this.createActivity({
      type: 'return',
      umbrellaNumber,
      borrower: umbrella.borrower || 'Unknown',
      location: returnLocation,
    });
  }

  async initializeAllUmbrellas(): Promise<void> {
    const umbrellasRef = ref(database, 'umbrellas');
    
    // Create all 21 umbrellas
    const umbrellaData: Record<string, any> = {};
    for (let i = 1; i <= 21; i++) {
      umbrellaData[i] = {
        umbrellaNumber: i,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    await set(umbrellasRef, umbrellaData);
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    const activitiesRef = ref(database, 'activities');
    const activitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(50));
    const snapshot = await get(activitiesQuery);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const activities: Activity[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      activities.push({
        id: child.key!,
        ...data,
        timestamp: new Date(data.timestamp),
      });
    });
    
    return activities.reverse(); // Latest first
  }

  async createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    const activitiesRef = ref(database, 'activities');
    const newActivityRef = push(activitiesRef);
    const activityId = newActivityRef.key!;
    
    const activityData = {
      ...activity,
      timestamp: new Date().toISOString(),
    };
    
    await set(newActivityRef, activityData);
    return { 
      id: activityId, 
      ...activity, 
      timestamp: new Date() 
    };
  }

  // Real-time listeners
  onUmbrellasChange(callback: (umbrellas: Umbrella[]) => void): () => void {
    const umbrellasRef = ref(database, 'umbrellas');
    
    const unsubscribe = onValue(umbrellasRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const umbrellas: Umbrella[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        umbrellas.push({
          id: parseInt(child.key!),
          ...data,
          borrowedAt: data.borrowedAt ? new Date(data.borrowedAt) : undefined,
          returnedAt: data.returnedAt ? new Date(data.returnedAt) : undefined,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        });
      });
      
      callback(umbrellas.sort((a, b) => a.umbrellaNumber - b.umbrellaNumber));
    });
    
    return () => off(umbrellasRef, 'value', unsubscribe);
  }

  onActivitiesChange(callback: (activities: Activity[]) => void): () => void {
    const activitiesRef = ref(database, 'activities');
    const activitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(20));
    
    const unsubscribe = onValue(activitiesQuery, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      
      const activities: Activity[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        activities.push({
          id: child.key!,
          ...data,
          timestamp: new Date(data.timestamp),
        });
      });
      
      callback(activities.reverse());
    });
    
    return () => off(activitiesRef, 'value', unsubscribe);
  }

  // Database management
  async resetDatabase(): Promise<void> {
    // Clear all data
    await remove(ref(database, 'activities'));
    await remove(ref(database, 'umbrellas'));
    
    // Reinitialize umbrellas
    await this.initializeAllUmbrellas();
  }
}

export const firebaseClient = new FirebaseClient();