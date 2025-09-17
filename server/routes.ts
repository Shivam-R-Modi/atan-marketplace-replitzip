import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { requireAuth } from "./middleware/auth";
import { trackUsage } from "./middleware/usageTracker";
import { storage } from "./storage";
import { pricingService } from "./services/pricingService";
import { aiService } from "./services/aiService";
import { analyticsService } from "./services/analyticsService";
import { insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Seed database with agents on startup
  await seedAgents();

  // Agent routes
  app.get("/api/agents", async (req, res, next) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:id", async (req, res, next) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      next(error);
    }
  });

  // Task routes
  app.post("/api/tasks", requireAuth, trackUsage, async (req, res, next) => {
    try {
      const validation = insertTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid task data" });
      }

      const { agentId, input, department, project } = validation.data;
      const agent = await storage.getAgent(agentId);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Create task in pending state
      const task = await storage.createTask({
        userId: req.user!.id,
        agentId,
        input,
        department,
        project,
        status: "processing",
        taskCost: "0",
        tokenCost: "0",
        totalCost: "0",
      });

      // Process task asynchronously
      processTaskAsync(task.id, agent.type, input);

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const tasks = await storage.getUserTasks(req.user!.id, limit);
      
      // Enrich with agent info
      const agents = await storage.getAgents();
      const agentMap = new Map(agents.map(a => [a.id, a]));
      
      const enrichedTasks = tasks.map(task => ({
        ...task,
        agent: agentMap.get(task.agentId),
      }));

      res.json(enrichedTasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task || task.userId !== req.user!.id) {
        return res.status(404).json({ message: "Task not found" });
      }

      const agent = await storage.getAgent(task.agentId);
      res.json({ ...task, agent });
    } catch (error) {
      next(error);
    }
  });

  // Analytics routes
  app.get("/api/analytics", requireAuth, async (req, res, next) => {
    try {
      const analytics = await analyticsService.getUserAnalytics(req.user!.id);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/analytics/departments", requireAuth, async (req, res, next) => {
    try {
      const departmentAnalytics = await analyticsService.getDepartmentAnalytics(req.user!.id);
      res.json(departmentAnalytics);
    } catch (error) {
      next(error);
    }
  });

  // Billing routes
  app.get("/api/billing/usage", requireAuth, async (req, res, next) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
      
      const metrics = await storage.getUserUsageMetrics(req.user!.id, startDate, endDate);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/billing/transactions", requireAuth, async (req, res, next) => {
    try {
      const transactions = await storage.getUserTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/billing/add-credits", requireAuth, async (req, res, next) => {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = parseFloat(user.creditsBalance) + amount;
      await storage.updateUserCredits(req.user!.id, newBalance.toString());

      await storage.createTransaction({
        userId: req.user!.id,
        amount: amount.toString(),
        type: "credit",
        description: "Credits added",
      });

      res.json({ success: true, newBalance });
    } catch (error) {
      next(error);
    }
  });

  // Pricing routes
  app.get("/api/pricing", (req, res) => {
    const pricing = pricingService.getAgentPricing();
    res.json(pricing);
  });

  // API Keys routes
  app.get("/api/keys", requireAuth, async (req, res, next) => {
    try {
      const apiKeys = await storage.getUserApiKeys(req.user!.id);
      res.json(apiKeys);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/keys", requireAuth, async (req, res, next) => {
    try {
      const { name } = req.body;
      const key = generateApiKey();
      const keyHash = await hashApiKey(key);
      const keyPrefix = key.substring(0, 12) + '••••••••••••••••••••••••••••';

      const apiKey = await storage.createApiKey({
        userId: req.user!.id,
        keyHash,
        keyPrefix,
        name: name || "API Key",
      });

      res.status(201).json({ ...apiKey, key }); // Only return full key once
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    // Send periodic updates
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'usage_update',
          data: {
            timestamp: new Date().toISOString(),
            // Real-time usage data would go here
          }
        }));
      }
    }, 30000);

    ws.on('close', () => clearInterval(interval));
  });

  return httpServer;
}

// Helper functions
async function seedAgents() {
  try {
    const existingAgents = await storage.getAgents();
    if (existingAgents.length > 0) return;

    const agentsData = [
      {
        name: "Invoice Processor",
        type: "invoice-processor",
        description: "Automated invoice processing, data extraction, and validation with 99.2% accuracy.",
        pricePerTask: "0.05",
        pricePerToken: "0.001",
        icon: "fas fa-file-invoice-dollar",
        capabilities: {
          formats: ["PDF", "Image", "Email"],
          languages: ["English", "Spanish", "French"],
          accuracy: "99.2%"
        }
      },
      {
        name: "Email Sorter",
        type: "email-sorter",
        description: "Intelligent email classification, priority sorting, and automated responses.",
        pricePerTask: "0.03",
        pricePerToken: "0.0008",
        icon: "fas fa-envelope-open-text",
        capabilities: {
          categories: ["Sales", "Support", "Marketing", "General"],
          languages: ["English", "Spanish"],
          accuracy: "96.8%"
        }
      },
      {
        name: "Data Entry",
        type: "data-entry",
        description: "Automated data extraction, validation, and entry from documents and forms.",
        pricePerTask: "0.02",
        pricePerToken: "0.0005",
        icon: "fas fa-database",
        capabilities: {
          formats: ["Forms", "Tables", "Documents"],
          validation: true,
          accuracy: "98.1%"
        }
      }
    ];

    for (const agentData of agentsData) {
      await storage.createAgent(agentData);
    }
  } catch (error) {
    console.error('Error seeding agents:', error);
  }
}

async function processTaskAsync(taskId: string, agentType: string, input: any) {
  try {
    let result;
    
    switch (agentType) {
      case 'invoice-processor':
        result = await aiService.processInvoice(input);
        break;
      case 'email-sorter':
        result = await aiService.sortEmails(input);
        break;
      case 'data-entry':
        result = await aiService.processDataEntry(input);
        break;
      default:
        throw new Error('Unknown agent type');
    }

    const agent = await storage.getAgent(taskId);
    if (!agent) throw new Error('Agent not found');

    const pricing = pricingService.calculateTaskCost(
      agent,
      result.inputTokens,
      result.outputTokens
    );

    await storage.updateTaskStatus(
      taskId,
      result.success ? 'completed' : 'failed',
      result.output,
      new Date()
    );

    // Update task costs
    await storage.db.update(storage.db.schema.tasks)
      .set({
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        taskCost: pricing.taskCost.toString(),
        tokenCost: pricing.tokenCost.toString(),
        totalCost: pricing.totalCost.toString(),
        errorMessage: result.error || null,
      })
      .where(storage.db.eq(storage.db.schema.tasks.id, taskId));

  } catch (error) {
    await storage.updateTaskStatus(taskId, 'failed', null);
    console.error('Task processing error:', error);
  }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'atan_sk_live_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashApiKey(key: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(key).digest('hex');
}
