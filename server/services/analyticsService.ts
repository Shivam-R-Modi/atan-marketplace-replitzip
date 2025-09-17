import { storage } from "../storage";
import { pricingService } from "./pricingService";

export interface AnalyticsData {
  todayUsage: {
    cost: number;
    tasks: number;
    tokens: number;
    change: number;
  };
  usageTrends: Array<{
    date: string;
    cost: number;
    tasks: number;
    tokens: number;
  }>;
  costBreakdown: {
    byAgent: Record<string, number>;
    byDepartment: Record<string, number>;
  };
  predictions: {
    daily: number;
    monthly: number;
    yearly: number;
    monthlyWithDiscount: number;
    yearlyWithDiscount: number;
    potentialSavings: number;
  };
}

export class AnalyticsService {
  async getUserAnalytics(userId: string): Promise<AnalyticsData> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get recent tasks for analysis
    const recentTasks = await storage.getUserTasks(userId, 1000);
    const todayTasks = recentTasks.filter(task => 
      task.createdAt && task.createdAt >= yesterday
    );
    
    const yesterdayTasks = recentTasks.filter(task => 
      task.createdAt && 
      task.createdAt >= new Date(yesterday.getTime() - 24 * 60 * 60 * 1000) &&
      task.createdAt < yesterday
    );

    // Calculate today's usage
    const todayUsage = {
      cost: todayTasks.reduce((sum, task) => sum + parseFloat(task.totalCost || "0"), 0),
      tasks: todayTasks.length,
      tokens: todayTasks.reduce((sum, task) => sum + (task.inputTokens || 0) + (task.outputTokens || 0), 0),
      change: 0,
    };

    const yesterdayUsage = {
      cost: yesterdayTasks.reduce((sum, task) => sum + parseFloat(task.totalCost || "0"), 0),
      tasks: yesterdayTasks.length,
    };

    // Calculate percentage change
    if (yesterdayUsage.cost > 0) {
      todayUsage.change = ((todayUsage.cost - yesterdayUsage.cost) / yesterdayUsage.cost) * 100;
    }

    // Generate usage trends for the last 7 days
    const usageTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayTasks = recentTasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      });

      usageTrends.push({
        date: date.toISOString().split('T')[0],
        cost: dayTasks.reduce((sum, task) => sum + parseFloat(task.totalCost || "0"), 0),
        tasks: dayTasks.length,
        tokens: dayTasks.reduce((sum, task) => sum + (task.inputTokens || 0) + (task.outputTokens || 0), 0),
      });
    }

    // Cost breakdown by agent and department
    const agents = await storage.getAgents();
    const costBreakdown = {
      byAgent: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    };

    // Initialize agent costs
    for (const agent of agents) {
      costBreakdown.byAgent[agent.name] = 0;
    }

    // Calculate costs
    for (const task of recentTasks.slice(0, 100)) { // Last 100 tasks
      const agent = agents.find(a => a.id === task.agentId);
      if (agent) {
        costBreakdown.byAgent[agent.name] += parseFloat(task.totalCost || "0");
      }

      if (task.department) {
        costBreakdown.byDepartment[task.department] = 
          (costBreakdown.byDepartment[task.department] || 0) + parseFloat(task.totalCost || "0");
      }
    }

    // Cost predictions
    const predictions = await pricingService.predictCosts(todayUsage.cost);

    return {
      todayUsage,
      usageTrends,
      costBreakdown,
      predictions,
    };
  }

  async getDepartmentAnalytics(userId: string): Promise<Array<{
    department: string;
    tasks: number;
    tokens: number;
    cost: number;
    trend: number;
  }>> {
    const tasks = await storage.getUserTasks(userId, 500);
    const departments = new Map<string, {
      tasks: number;
      tokens: number;
      cost: number;
      recentTasks: number;
      oldTasks: number;
    }>();

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    for (const task of tasks) {
      const dept = task.department || 'Unknown';
      if (!departments.has(dept)) {
        departments.set(dept, { tasks: 0, tokens: 0, cost: 0, recentTasks: 0, oldTasks: 0 });
      }

      const deptData = departments.get(dept)!;
      deptData.tasks += 1;
      deptData.tokens += (task.inputTokens || 0) + (task.outputTokens || 0);
      deptData.cost += parseFloat(task.totalCost || "0");

      // Track trend
      if (task.createdAt && task.createdAt >= threeDaysAgo) {
        deptData.recentTasks += 1;
      } else {
        deptData.oldTasks += 1;
      }
    }

    return Array.from(departments.entries()).map(([department, data]) => {
      const trend = data.oldTasks > 0 
        ? ((data.recentTasks - data.oldTasks) / data.oldTasks) * 100
        : 0;

      return {
        department,
        tasks: data.tasks,
        tokens: data.tokens,
        cost: data.cost,
        trend,
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
