import { Badge } from "@/components/ui/badge";
import { Task, Agent } from "@shared/schema";

interface TaskQueueProps {
  tasks: (Task & { agent?: Agent })[];
}

export default function TaskQueue({ tasks }: TaskQueueProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTime = (date: string | Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffMs = now.getTime() - taskDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return taskDate.toLocaleDateString();
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Start your first task from the marketplace.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Task ID</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Agent</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Department</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Tokens</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Cost</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr 
              key={task.id} 
              className="border-b border-border hover:bg-muted/50" 
              data-testid={`task-row-${index}`}
            >
              <td className="py-3 text-foreground font-mono text-sm">
                #{task.id.substring(0, 8)}
              </td>
              <td className="py-3 text-foreground">
                {task.agent?.name || "Unknown Agent"}
              </td>
              <td className="py-3 text-muted-foreground">
                {task.department || "N/A"}
              </td>
              <td className="py-3 text-foreground">
                {((task.inputTokens || 0) + (task.outputTokens || 0)) > 1000 
                  ? `${(((task.inputTokens || 0) + (task.outputTokens || 0)) / 1000).toFixed(1)}K`
                  : (task.inputTokens || 0) + (task.outputTokens || 0)
                }
              </td>
              <td className="py-3 text-foreground">
                ${parseFloat(task.totalCost || "0").toFixed(3)}
              </td>
              <td className="py-3">
                {getStatusBadge(task.status)}
              </td>
              <td className="py-3 text-muted-foreground">
                {task.createdAt ? formatTime(task.createdAt) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
