import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

const AGENT_PRICING = {
  "invoice-processor": { basePrice: 0.05, tokenPrice: 0.001 },
  "email-sorter": { basePrice: 0.03, tokenPrice: 0.0008 },
  "data-entry": { basePrice: 0.02, tokenPrice: 0.0005 },
};

const VOLUME_DISCOUNTS = [
  { threshold: 10000, discount: 0.20, label: "20% (10,000+ tasks/day)" },
  { threshold: 1000, discount: 0.10, label: "10% (1,000+ tasks/day)" },
  { threshold: 100, discount: 0.05, label: "5% (100+ tasks/day)" },
];

export default function PricingCalculator() {
  const [agent, setAgent] = useState<keyof typeof AGENT_PRICING>("invoice-processor");
  const [tasks, setTasks] = useState(100);
  const [tokensPerTask, setTokensPerTask] = useState(1000);
  const [calculation, setCalculation] = useState({
    taskCost: 0,
    tokenCost: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    discountLabel: "",
  });

  useEffect(() => {
    const pricing = AGENT_PRICING[agent];
    const taskCost = tasks * pricing.basePrice;
    const tokenCost = (tasks * tokensPerTask / 1000) * pricing.tokenPrice;
    const subtotal = taskCost + tokenCost;
    
    // Calculate volume discount
    let discount = 0;
    let discountLabel = "No discount";
    
    for (const volumeDiscount of VOLUME_DISCOUNTS) {
      if (tasks >= volumeDiscount.threshold) {
        discount = volumeDiscount.discount;
        discountLabel = volumeDiscount.label;
        break;
      }
    }
    
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    setCalculation({
      taskCost,
      tokenCost,
      subtotal,
      discount: discountAmount,
      total,
      discountLabel,
    });
  }, [agent, tasks, tokensPerTask]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pricing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="agent-select">Agent Type</Label>
            <Select value={agent} onValueChange={(value) => setAgent(value as keyof typeof AGENT_PRICING)}>
              <SelectTrigger id="agent-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice-processor">Invoice Processor</SelectItem>
                <SelectItem value="email-sorter">Email Sorter</SelectItem>
                <SelectItem value="data-entry">Data Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tasks-input">Number of Tasks</Label>
            <Input
              id="tasks-input"
              type="number"
              value={tasks}
              onChange={(e) => setTasks(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokens-input">Tokens per Task</Label>
            <Input
              id="tokens-input"
              type="number"
              value={tokensPerTask}
              onChange={(e) => setTokensPerTask(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Task costs ({tasks} × ${AGENT_PRICING[agent].basePrice}):</span>
            <span>${calculation.taskCost.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Token costs ({(tasks * tokensPerTask / 1000).toFixed(1)}K × ${AGENT_PRICING[agent].tokenPrice}):</span>
            <span>${calculation.tokenCost.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span>Subtotal:</span>
            <span>${calculation.subtotal.toFixed(2)}</span>
          </div>
          
          {calculation.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Volume discount:</span>
              <span>-${calculation.discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
            <span>Total:</span>
            <span>${calculation.total.toFixed(2)}</span>
          </div>
        </div>

        {calculation.discount > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {calculation.discountLabel}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
