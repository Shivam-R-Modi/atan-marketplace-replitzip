import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import UsageBreakdown from "@/components/UsageBreakdown";
import CostPredictor from "@/components/CostPredictor";

export default function Analytics() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: departmentAnalytics } = useQuery({
    queryKey: ["/api/analytics/departments"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into your AI agent usage and costs</p>
        </div>

        {/* Cost Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageBreakdown data={analytics?.costBreakdown?.byAgent} type="agent" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Trends (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageBreakdown data={analytics?.usageTrends} type="trends" />
            </CardContent>
          </Card>
        </div>

        {/* Cost Predictor */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cost Predictor</CardTitle>
          </CardHeader>
          <CardContent>
            <CostPredictor predictions={analytics?.predictions} />
          </CardContent>
        </Card>

        {/* Department Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Department</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Tasks</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Tokens</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Cost</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentAnalytics?.map((dept: any, index: number) => (
                    <tr key={dept.department} className="border-b border-border" data-testid={`row-department-${index}`}>
                      <td className="py-3 text-foreground font-medium">{dept.department}</td>
                      <td className="py-3 text-foreground">{dept.tasks}</td>
                      <td className="py-3 text-foreground">
                        {dept.tokens > 1000 ? `${(dept.tokens / 1000).toFixed(1)}K` : dept.tokens}
                      </td>
                      <td className="py-3 text-foreground">${dept.cost.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`text-sm ${dept.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {dept.trend >= 0 ? "↗" : "↘"} {Math.abs(dept.trend).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No department data available
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
