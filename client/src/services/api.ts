import { apiRequest } from "@/lib/queryClient";

export interface TaskInput {
  agentId: string;
  input: any;
  department?: string;
  project?: string;
}

export interface TaskResponse {
  id: string;
  status: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: string;
  createdAt: string;
}

export class ApiService {
  // Agent methods
  static async getAgents() {
    const res = await apiRequest("GET", "/api/agents");
    return res.json();
  }

  static async getAgent(id: string) {
    const res = await apiRequest("GET", `/api/agents/${id}`);
    return res.json();
  }

  // Task methods
  static async createTask(taskData: TaskInput): Promise<TaskResponse> {
    const res = await apiRequest("POST", "/api/tasks", taskData);
    return res.json();
  }

  static async getTasks(limit = 50) {
    const res = await apiRequest("GET", `/api/tasks?limit=${limit}`);
    return res.json();
  }

  static async getTask(id: string) {
    const res = await apiRequest("GET", `/api/tasks/${id}`);
    return res.json();
  }

  // Analytics methods
  static async getAnalytics() {
    const res = await apiRequest("GET", "/api/analytics");
    return res.json();
  }

  static async getDepartmentAnalytics() {
    const res = await apiRequest("GET", "/api/analytics/departments");
    return res.json();
  }

  // Billing methods
  static async getUsageMetrics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    
    const res = await apiRequest("GET", `/api/billing/usage?${params}`);
    return res.json();
  }

  static async getTransactions() {
    const res = await apiRequest("GET", "/api/billing/transactions");
    return res.json();
  }

  static async addCredits(amount: number) {
    const res = await apiRequest("POST", "/api/billing/add-credits", { amount });
    return res.json();
  }

  // API Key methods
  static async getApiKeys() {
    const res = await apiRequest("GET", "/api/keys");
    return res.json();
  }

  static async createApiKey(name: string) {
    const res = await apiRequest("POST", "/api/keys", { name });
    return res.json();
  }

  // Pricing methods
  static async getPricing() {
    const res = await apiRequest("GET", "/api/pricing");
    return res.json();
  }
}
