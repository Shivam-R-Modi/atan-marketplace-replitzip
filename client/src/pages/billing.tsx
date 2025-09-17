import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";

export default function Billing() {
  const { user } = useAuth();
  
  const { data: usage } = useQuery({
    queryKey: ["/api/billing/usage"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/billing/transactions"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  // Calculate current period usage
  const currentUsage = tasks?.reduce((sum: number, task: any) => 
    sum + parseFloat(task.totalCost || "0"), 0) || 0;
  
  const monthlyBudget = parseFloat(user?.monthlyBudget || "1000");
  const budgetUsage = (currentUsage / monthlyBudget) * 100;

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    console.log("Exporting CSV...");
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF file
    console.log("Exporting PDF...");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Billing & Usage</h2>
          <p className="text-muted-foreground">Detailed billing information and usage reports</p>
        </div>

        {/* Billing Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Billing Period</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      ${currentUsage.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Current Usage</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground mb-1">
                      ${monthlyBudget.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Budget</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Usage</span>
                    <span>{budgetUsage.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={budgetUsage} 
                    className={budgetUsage > 80 ? "text-destructive" : ""}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Task Costs:</span>
                    <span className="font-medium">${(currentUsage * 0.75).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Token Costs:</span>
                    <span className="font-medium">${(currentUsage * 0.25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${currentUsage.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <div>
                      <div className="text-sm font-medium">•••• •••• •••• 4242</div>
                      <div className="text-xs text-muted-foreground">Expires 12/26</div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded border-border" 
                        defaultChecked 
                        data-testid="checkbox-auto-topup"
                      />
                      <span>Auto-top-up when credits &lt; $50</span>
                    </label>
                  </div>
                  <Button className="w-full" data-testid="button-add-credits">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Usage Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detailed Usage Breakdown</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportCSV}
                  data-testid="button-export-csv"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF}
                  data-testid="button-export-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Agent</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Department</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Input Tokens</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Output Tokens</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks?.slice(0, 10).map((task: any, index: number) => (
                    <tr key={task.id} className="border-b border-border" data-testid={`row-task-${index}`}>
                      <td className="py-3 text-foreground">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-foreground">{task.agent?.name}</td>
                      <td className="py-3 text-muted-foreground">{task.department || 'N/A'}</td>
                      <td className="py-3 text-foreground">{task.inputTokens || 0}</td>
                      <td className="py-3 text-foreground">{task.outputTokens || 0}</td>
                      <td className="py-3 text-foreground text-right">
                        ${parseFloat(task.totalCost || "0").toFixed(2)}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No usage data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
