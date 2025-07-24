import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const umbrellas = pgTable("umbrellas", {
  id: serial("id").primaryKey(),
  umbrellaNumber: integer("umbrella_number").notNull().unique(),
  status: text("status").notNull().default("available"), // 'available' or 'borrowed'
  borrower: text("borrower"),
  borrowerPhone: text("borrower_phone"),
  borrowLocation: text("borrow_location"),
  borrowedAt: timestamp("borrowed_at"),
  returnLocation: text("return_location"),
  returnedAt: timestamp("returned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'borrow' or 'return'
  umbrellaNumber: integer("umbrella_number").notNull(),
  borrower: text("borrower").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUmbrellaSchema = createInsertSchema(umbrellas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUmbrella = z.infer<typeof insertUmbrellaSchema>;
export type Umbrella = typeof umbrellas.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
