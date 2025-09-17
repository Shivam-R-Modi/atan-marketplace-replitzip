import { Agent, Task } from "@shared/schema";

export interface PricingResult {
  taskCost: number;
  tokenCost: number;
  totalCost: number;
  volumeDiscount: number;
  discountedCost: number;
}

export interface VolumeDiscount {
  threshold: number;
  discount: number;
}

const VOLUME_DISCOUNTS: VolumeDiscount[] = [
  { threshold: 10000, discount: 0.20 }, // 20% for 10,000+ tasks/day
  { threshold: 1000, discount: 0.10 },  // 10% for 1,000+ tasks/day
  { threshold: 100, discount: 0.05 },   // 5% for 100+ tasks/day
];

export class PricingService {
  calculateTaskCost(agent: Agent, inputTokens: number, outputTokens: number): PricingResult {
    const taskCost = parseFloat(agent.pricePerTask);
    const tokenPrice = parseFloat(agent.pricePerToken);
    const totalTokens = inputTokens + outputTokens;
    const tokenCost = (totalTokens / 1000) * tokenPrice; // Price per 1K tokens
    const totalCost = taskCost + tokenCost;

    return {
      taskCost,
      tokenCost,
      totalCost,
      volumeDiscount: 0,
      discountedCost: totalCost,
    };
  }

  calculateVolumeDiscount(dailyTaskCount: number, originalCost: number): PricingResult {
    let discount = 0;
    
    for (const volumeDiscount of VOLUME_DISCOUNTS) {
      if (dailyTaskCount >= volumeDiscount.threshold) {
        discount = volumeDiscount.discount;
        break;
      }
    }

    const discountedCost = originalCost * (1 - discount);
    const taskCost = originalCost * 0.75; // Approximate task portion
    const tokenCost = originalCost * 0.25; // Approximate token portion

    return {
      taskCost,
      tokenCost,
      totalCost: originalCost,
      volumeDiscount: discount,
      discountedCost,
    };
  }

  calculateBulkDiscount(monthlyTaskCount: number, yearlyTaskCount: number): {
    monthlyDiscount: number;
    yearlyDiscount: number;
  } {
    let monthlyDiscount = 0;
    let yearlyDiscount = 0;

    // Monthly projection discount (10% for sustained usage)
    if (monthlyTaskCount >= 1000) {
      monthlyDiscount = 0.10;
    }

    // Yearly projection discount (20% for annual commitment)
    if (yearlyTaskCount >= 10000) {
      yearlyDiscount = 0.20;
    }

    return { monthlyDiscount, yearlyDiscount };
  }

  async predictCosts(currentDailyCost: number): Promise<{
    daily: number;
    monthly: number;
    yearly: number;
    monthlyWithDiscount: number;
    yearlyWithDiscount: number;
    potentialSavings: number;
  }> {
    const daily = currentDailyCost;
    const monthly = daily * 30;
    const yearly = daily * 365;

    const monthlyWithDiscount = monthly * 0.90; // 10% volume discount
    const yearlyWithDiscount = yearly * 0.80;   // 20% volume discount
    
    const potentialSavings = yearly - yearlyWithDiscount;

    return {
      daily,
      monthly,
      yearly,
      monthlyWithDiscount,
      yearlyWithDiscount,
      potentialSavings,
    };
  }

  getAgentPricing() {
    return {
      "invoice-processor": {
        basePrice: 0.05,
        tokenPrice: 0.001,
        description: "Invoice processing, data extraction, and validation"
      },
      "email-sorter": {
        basePrice: 0.03,
        tokenPrice: 0.0008,
        description: "Email classification, priority sorting, and automated responses"
      },
      "data-entry": {
        basePrice: 0.02,
        tokenPrice: 0.0005,
        description: "Data extraction, validation, and entry from documents"
      }
    };
  }
}

export const pricingService = new PricingService();
