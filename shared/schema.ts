import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  companyName: text("company_name"),
  walletAddress: text("wallet_address"),
  creditsBalance: decimal("credits_balance", { precision: 10, scale: 2 }).default("0.00"),
  autoTopUp: boolean("auto_top_up").default(false),
  autoTopUpAmount: decimal("auto_top_up_amount", { precision: 10, scale: 2 }).default("100.00"),
  autoTopUpThreshold: decimal("auto_top_up_threshold", { precision: 10, scale: 2 }).default("50.00"),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }).default("1000.00"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  pricePerTask: decimal("price_per_task", { precision: 10, scale: 4 }).notNull(),
  pricePerToken: decimal("price_per_token", { precision: 10, scale: 6 }).notNull(),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  isActive: boolean("is_active").default(true),
  icon: text("icon"),
  capabilities: jsonb("capabilities"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  taskCost: decimal("task_cost", { precision: 10, scale: 4 }).notNull(),
  tokenCost: decimal("token_cost", { precision: 10, scale: 4 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).notNull(),
  status: text("status").notNull().default("pending"),
  department: text("department"),
  project: text("project"),
  input: jsonb("input"),
  output: jsonb("output"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "credit", "debit", "refund"
  description: text("description").notNull(),
  taskId: uuid("task_id").references(() => tasks.id),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const usageMetrics = pgTable("usage_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  taskCount: integer("task_count").default(0),
  agentUsage: jsonb("agent_usage"), // {"agent_id": task_count}
  tokenCount: integer("token_count").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).default("0.00"),
  department: text("department"),
});

export const pricingTiers = pgTable("pricing_tiers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  agentType: text("agent_type").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 4 }).notNull(),
  tokenPrice: decimal("token_price", { precision: 10, scale: 6 }).notNull(),
  bulkDiscount: decimal("bulk_discount", { precision: 5, scale: 2 }).default("0.00"),
  minTasksForDiscount: integer("min_tasks_for_discount").default(100),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  name: text("name"),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  transactions: many(transactions),
  usageMetrics: many(usageMetrics),
  apiKeys: many(apiKeys),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
  agent: one(agents, { fields: [tasks.agentId], references: [agents.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  task: one(tasks, { fields: [transactions.taskId], references: [tasks.id] }),
}));

export const usageMetricsRelations = relations(usageMetrics, ({ one }) => ({
  user: one(users, { fields: [usageMetrics.userId], references: [users.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  companyName: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  agentId: true,
  input: true,
  department: true,
  project: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  type: true,
  description: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type UsageMetric = typeof usageMetrics.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
