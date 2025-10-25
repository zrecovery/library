import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id"), // null for system settings
  key: text("key").notNull(),
  value: text("value").notNull(), // stored as JSON string
  type: text("type", {
    enum: ["string", "number", "boolean", "json"],
  }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const InsertSettingSchema = createInsertSchema(settings);
