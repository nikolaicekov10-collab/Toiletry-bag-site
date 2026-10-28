import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dailyTraffic = sqliteTable("daily_traffic", {
  day: text("day").primaryKey(),
  views: integer("views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  enquiries: integer("enquiries").notNull().default(0),
  orders: integer("orders").notNull().default(0),
});

export const dailyVisitors = sqliteTable(
  "daily_visitors",
  {
    day: text("day").notNull(),
    visitorId: text("visitor_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.day, table.visitorId] })],
);

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["enquiry", "order", "quick-order"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  product: text("product"),
  createdAt: text("created_at").notNull(),
});
