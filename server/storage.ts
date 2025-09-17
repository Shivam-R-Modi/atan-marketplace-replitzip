import { users, agents, tasks, transactions, usageMetrics, apiKeys, type User, type InsertUser, type Task, type Agent, type Transaction, type UsageMetric, type ApiKey } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sum, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, amount: string): Promise<void>;
  
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: Partial<Agent>): Promise<Agent>;
  
  createTask(task: Partial<Task>): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
  getUserTasks(userId: string, limit?: number): Promise<Task[]>;
  updateTaskStatus(taskId: string, status: string, output?: any, completedAt?: Date): Promise<void>;
  
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  
  createUsageMetric(metric: Partial<UsageMetric>): Promise<UsageMetric>;
  getUserUsageMetrics(userId: string, startDate: Date, endDate: Date): Promise<UsageMetric[]>;
  
  createApiKey(apiKey: Partial<ApiKey>): Promise<ApiKey>;
  getApiKey(keyHash: string): Promise<ApiKey | undefined>;
  getUserApiKeys(userId: string): Promise<ApiKey[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({ creditsBalance: amount })
      .where(eq(users.id, userId));
  }

  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.isActive, true));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: Partial<Agent>): Promise<Agent> {
    const [agent] = await db
      .insert(agents)
      .values(insertAgent as any)
      .returning();
    return agent;
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task as any)
      .returning();
    return newTask;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getUserTasks(userId: string, limit = 50): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async updateTaskStatus(taskId: string, status: string, output?: any, completedAt?: Date): Promise<void> {
    await db
      .update(tasks)
      .set({ 
        status, 
        output, 
        completedAt: completedAt || new Date() 
      })
      .where(eq(tasks.id, taskId));
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction as any)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createUsageMetric(metric: Partial<UsageMetric>): Promise<UsageMetric> {
    const [newMetric] = await db
      .insert(usageMetrics)
      .values(metric as any)
      .returning();
    return newMetric;
  }

  async getUserUsageMetrics(userId: string, startDate: Date, endDate: Date): Promise<UsageMetric[]> {
    return await db
      .select()
      .from(usageMetrics)
      .where(
        and(
          eq(usageMetrics.userId, userId),
          gte(usageMetrics.date, startDate),
          lte(usageMetrics.date, endDate)
        )
      )
      .orderBy(desc(usageMetrics.date));
  }

  async createApiKey(apiKey: Partial<ApiKey>): Promise<ApiKey> {
    const [newApiKey] = await db
      .insert(apiKeys)
      .values(apiKey as any)
      .returning();
    return newApiKey;
  }

  async getApiKey(keyHash: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash));
    return apiKey || undefined;
  }

  async getUserApiKeys(userId: string): Promise<ApiKey[]> {
    return await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }
}

export const storage = new DatabaseStorage();
