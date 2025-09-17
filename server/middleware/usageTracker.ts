import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export function trackUsage(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Track usage after successful response
    if (req.user && res.statusCode === 200) {
      // This would normally be done in a background job
      setImmediate(async () => {
        try {
          await storage.createUsageMetric({
            userId: req.user!.id,
            date: new Date(),
            taskCount: 1,
            tokenCount: body.inputTokens + body.outputTokens || 0,
            totalCost: body.totalCost || "0",
            department: req.body.department || null,
          });
        } catch (error) {
          console.error('Failed to track usage:', error);
        }
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}
