import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ message: "API key required" });
  }

  // In a real implementation, validate the API key against the database
  // For now, just check if it starts with the expected prefix
  if (!apiKey.startsWith('atan_sk_')) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  next();
}
