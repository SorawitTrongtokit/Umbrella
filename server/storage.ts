import { users, umbrellas, activities, type User, type InsertUser, type Umbrella, type InsertUmbrella, type Activity, type InsertActivity } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc } from "drizzle-orm";

// Dynamic import for postgres
let sql: any;
let db: any;

async function initDB() {
  if (!sql) {
    const postgres = await import('postgres');
    const connectionString = process.env.DATABASE_URL || "";
    sql = postgres.default(connectionString);
    db = drizzle(sql);
  }
  return db;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Umbrella methods
  getAllUmbrellas(): Promise<Umbrella[]>;
  getUmbrellaByNumber(umbrellaNumber: number): Promise<Umbrella | undefined>;
  createUmbrella(umbrella: InsertUmbrella): Promise<Umbrella>;
  updateUmbrella(umbrellaNumber: number, data: Partial<InsertUmbrella>): Promise<Umbrella>;
  initializeAllUmbrellas(): Promise<void>;
  
  // Activity methods
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Database management
  resetDatabase(): Promise<void>;
}

export class PostgresStorage implements IStorage {
  private async getDB() {
    return await initDB();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const database = await this.getDB();
    const result = await database.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = await this.getDB();
    const result = await database.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = await this.getDB();
    const result = await database.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Umbrella methods
  async getAllUmbrellas(): Promise<Umbrella[]> {
    const database = await this.getDB();
    const result = await database.select().from(umbrellas).orderBy(umbrellas.umbrellaNumber);
    return result;
  }

  async getUmbrellaByNumber(umbrellaNumber: number): Promise<Umbrella | undefined> {
    const database = await this.getDB();
    const result = await database.select().from(umbrellas).where(eq(umbrellas.umbrellaNumber, umbrellaNumber));
    return result[0];
  }

  async createUmbrella(umbrella: InsertUmbrella): Promise<Umbrella> {
    const database = await this.getDB();
    const result = await database.insert(umbrellas).values(umbrella).returning();
    return result[0];
  }

  async updateUmbrella(umbrellaNumber: number, data: Partial<InsertUmbrella>): Promise<Umbrella> {
    const database = await this.getDB();
    const updateData = { ...data, updatedAt: new Date() };
    const result = await database
      .update(umbrellas)
      .set(updateData)
      .where(eq(umbrellas.umbrellaNumber, umbrellaNumber))
      .returning();
    return result[0];
  }

  async initializeAllUmbrellas(): Promise<void> {
    const database = await this.getDB();
    
    // Clear existing umbrellas
    await database.delete(umbrellas);
    
    // Create all 21 umbrellas
    const umbrellaData = [];
    for (let i = 1; i <= 21; i++) {
      umbrellaData.push({
        umbrellaNumber: i,
        status: 'available' as const,
      });
    }
    
    await database.insert(umbrellas).values(umbrellaData);
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    const database = await this.getDB();
    const result = await database.select().from(activities).orderBy(desc(activities.timestamp)).limit(50);
    return result;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const database = await this.getDB();
    const result = await database.insert(activities).values(activity).returning();
    return result[0];
  }

  // Database management
  async resetDatabase(): Promise<void> {
    const database = await this.getDB();
    
    // Clear all data
    await database.delete(activities);
    await database.delete(umbrellas);
    
    // Reinitialize umbrellas
    await this.initializeAllUmbrellas();
  }
}

export const storage = new PostgresStorage();
