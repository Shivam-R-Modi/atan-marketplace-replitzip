import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";

interface RealTimeChartProps {
  data: Array<{
    date: string;
    cost: number;
    tasks: number;
    tokens: number;
  }>;
}

export default function RealTimeChart({ data }: RealTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No usage data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: item.cost,
    tasks: item.tasks,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="hsl(214, 16%, 47%)"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="hsl(214, 16%, 47%)"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'cost' ? `$${value.toFixed(2)}` : value.toString(),
              name === 'cost' ? 'Cost' : 'Tasks'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ 
              backgroundColor: "hsl(0, 0%, 100%)", 
              border: "1px solid hsl(214, 32%, 91%)",
              borderRadius: "0.5rem"
            }}
          />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="hsl(217, 91%, 60%)"
            fillOpacity={1}
            fill="url(#costGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
