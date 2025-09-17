import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react";

interface CostPredictorProps {
  predictions?: {
    daily: number;
    monthly: number;
    yearly: number;
    monthlyWithDiscount: number;
    yearlyWithDiscount: number;
    potentialSavings: number;
  };
}

export default function CostPredictor({ predictions }: CostPredictorProps) {
  if (!predictions) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 bg-muted rounded-lg animate-pulse">
            <div className="h-8 bg-muted-foreground/20 rounded mb-1"></div>
            <div className="h-4 bg-muted-foreground/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const predictionItems = [
    {
      icon: DollarSign,
      value: `$${predictions.daily.toFixed(2)}`,
      label: "Today's Projection",
      description: "Based on current usage",
      testId: "prediction-daily"
    },
    {
      icon: Calendar,
      value: `$${predictions.monthlyWithDiscount.toFixed(2)}`,
      label: "Monthly Projection",
      description: "10% volume discount",
      discount: true,
      testId: "prediction-monthly"
    },
    {
      icon: TrendingUp,
      value: `$${predictions.yearlyWithDiscount.toFixed(2)}`,
      label: "Yearly Projection",
      description: "20% volume discount",
      discount: true,
      testId: "prediction-yearly"
    },
    {
      icon: Target,
      value: `$${predictions.potentialSavings.toFixed(2)}`,
      label: "Potential Savings",
      description: "With optimization",
      savings: true,
      testId: "prediction-savings"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {predictionItems.map((item) => {
        const IconComponent = item.icon;
        const cardClass = item.savings 
          ? "bg-primary/10 border border-primary/20" 
          : "bg-muted";
        const valueClass = item.savings 
          ? "text-primary" 
          : "text-foreground";

        return (
          <div 
            key={item.label}
            className={`text-center p-4 rounded-lg ${cardClass}`}
            data-testid={item.testId}
          >
            <div className="flex items-center justify-center mb-2">
              <IconComponent className={`h-5 w-5 ${item.savings ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className={`text-2xl font-bold mb-1 ${valueClass}`}>
              {item.value}
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              {item.label}
            </div>
            <div className={`text-xs ${item.discount || item.savings ? 'text-green-600' : 'text-muted-foreground'}`}>
              {item.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
