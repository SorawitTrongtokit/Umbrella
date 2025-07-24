// Firebase-only storage implementation for Netlify deployment
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  push, 
  query, 
  orderByChild, 
  equalTo,
  orderByKey,
  limitToLast,
  remove
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface User {
  id: string;
  username: string;
  password: string;
}

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

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  
  // Umbrella methods
  getAllUmbrellas(): Promise<Umbrella[]>;
  getUmbrellaByNumber(umbrellaNumber: number): Promise<Umbrella | undefined>;
  createUmbrella(umbrella: Omit<Umbrella, 'id'>): Promise<Umbrella>;
  updateUmbrella(umbrellaNumber: number, data: Partial<Umbrella>): Promise<Umbrella>;
  initializeAllUmbrellas(): Promise<void>;
  
  // Activity methods
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity>;
  
  // Database management
  resetDatabase(): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const userRef = ref(database, `users/${id}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? { id, ...snapshot.val() } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersRef = ref(database, 'users');
    const userQuery = query(usersRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(userQuery);
    
    if (snapshot.exists()) {
      const userData = Object.entries(snapshot.val())[0];
      return { id: userData[0], ...userData[1] as Omit<User, 'id'> };
    }
    return undefined;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const usersRef = ref(database, 'users');
    const newUserRef = push(usersRef);
    const userId = newUserRef.key!;
    
    await set(newUserRef, user);
    return { id: userId, ...user };
  }

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
    const umbrellas = await this.getAllUmbrellas();
    return umbrellas.find(u => u.umbrellaNumber === umbrellaNumber);
  }

  async createUmbrella(umbrella: Omit<Umbrella, 'id'>): Promise<Umbrella> {
    const umbrellaRef = ref(database, `umbrellas/${umbrella.umbrellaNumber}`);
    const umbrellaData = {
      ...umbrella,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await set(umbrellaRef, umbrellaData);
    return { id: umbrella.umbrellaNumber, ...umbrella };
  }

  async updateUmbrella(umbrellaNumber: number, data: Partial<Umbrella>): Promise<Umbrella> {
    const umbrellaRef = ref(database, `umbrellas/${umbrellaNumber}`);
    const currentUmbrella = await this.getUmbrellaByNumber(umbrellaNumber);
    
    if (!currentUmbrella) {
      throw new Error(`Umbrella ${umbrellaNumber} not found`);
    }
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
      borrowedAt: data.borrowedAt?.toISOString(),
      returnedAt: data.returnedAt?.toISOString(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    
    await set(umbrellaRef, { ...currentUmbrella, ...updateData });
    return { ...currentUmbrella, ...data };
  }

  async initializeAllUmbrellas(): Promise<void> {
    const umbrellasRef = ref(database, 'umbrellas');
    
    // Clear existing umbrellas
    await remove(umbrellasRef);
    
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

  // Database management
  async resetDatabase(): Promise<void> {
    // Clear all data
    await remove(ref(database, 'activities'));
    await remove(ref(database, 'umbrellas'));
    
    // Reinitialize umbrellas
    await this.initializeAllUmbrellas();
  }
}

export const storage = new FirebaseStorage();