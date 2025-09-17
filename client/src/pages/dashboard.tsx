import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, CheckCircle, Bot, Coins } from "lucide-react";
import Navbar from "@/components/Navbar";
import TaskQueue from "@/components/TaskQueue";
import RealTimeChart from "@/components/RealTimeChart";

export default function Dashboard() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const recentTasks = Array.isArray(tasks) ? tasks.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Monitor your AI agent usage and costs in real-time</p>
        </div>

        {/* Budget Alert */}
        {analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage && analytics.todayUsage.cost > 50 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Budget Alert:</strong> You've used a significant portion of your daily budget.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-today-usage">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Today's Usage</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${(analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.cost?.toFixed(2)) || "0.00"}
                  </p>
                  <p className={`text-sm ${
                    ((analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.change) || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {((analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.change) || 0) >= 0 ? "+" : ""}
                    {(analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.change?.toFixed(1)) || "0.0"}% from yesterday
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-tasks-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Tasks Completed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.tasks) || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">Today</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-agents">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Agents</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-muted-foreground text-sm">All operational</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-tokens-used">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Tokens Used</p>
                  <p className="text-2xl font-bold text-foreground">
                    {((analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.tokens) || 0) > 1000 
                      ? `${(((analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.tokens) || 0) / 1000).toFixed(1)}K`
                      : (analytics && typeof analytics === 'object' && 'todayUsage' in analytics && analytics.todayUsage?.tokens) || 0
                    }
                  </p>
                  <p className="text-muted-foreground text-sm">Today</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Coins className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Usage Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Real-time Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeChart data={analytics && typeof analytics === 'object' && 'usageTrends' in analytics && Array.isArray(analytics.usageTrends) ? analytics.usageTrends : []} />
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Tasks</CardTitle>
              <Button variant="ghost" size="sm" data-testid="button-view-all-tasks">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskQueue tasks={recentTasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
