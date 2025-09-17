import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface UsageBreakdownProps {
  data: any;
  type: "agent" | "department" | "trends";
}

const COLORS = ["hsl(217, 91%, 60%)", "hsl(173, 58%, 39%)", "hsl(43, 74%, 66%)", "hsl(27, 87%, 67%)", "hsl(197, 37%, 24%)"];

export default function UsageBreakdown({ data, type }: UsageBreakdownProps) {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  if (type === "trends" && Array.isArray(data)) {
    const chartData = data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cost: item.cost,
      tasks: item.tasks,
    }));

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="hsl(214, 16%, 47%)"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(214, 16%, 47%)"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(0, 0%, 100%)", 
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "0.5rem"
              }}
            />
            <Bar dataKey="tasks" fill="hsl(217, 91%, 60%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // For agent and department breakdowns (pie chart)
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value: typeof value === 'number' ? value : 0,
  })).filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No usage data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [
              type === "agent" ? `$${value.toFixed(2)}` : value.toString(),
              name
            ]}
            contentStyle={{ 
              backgroundColor: "hsl(0, 0%, 100%)", 
              border: "1px solid hsl(214, 32%, 91%)",
              borderRadius: "0.5rem"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
