import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, MailOpen, Database, Play } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
}

const iconMap = {
  "invoice-processor": DollarSign,
  "email-sorter": MailOpen,
  "data-entry": Database,
};

const colorMap = {
  "invoice-processor": "bg-blue-50 text-primary",
  "email-sorter": "bg-green-50 text-green-600",
  "data-entry": "bg-purple-50 text-purple-600",
};

export default function AgentCard({ agent }: AgentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    department: "",
    project: "",
    input: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const IconComponent = iconMap[agent.type as keyof typeof iconMap] || DollarSign;
  const iconClass = colorMap[agent.type as keyof typeof colorMap] || "bg-blue-50 text-primary";

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tasks", {
        agentId: agent.id,
        input: JSON.parse(data.input),
        department: data.department,
        project: data.project,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Task Started",
        description: `${agent.name} task has been queued for processing.`,
      });
      setIsOpen(false);
      setTaskData({ department: "", project: "", input: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Task Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartTask = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate JSON input
      JSON.parse(taskData.input);
      createTaskMutation.mutate(taskData);
    } catch (error) {
      toast({
        title: "Invalid Input",
        description: "Please provide valid JSON input for the task.",
        variant: "destructive",
      });
    }
  };

  const getExampleInput = () => {
    switch (agent.type) {
      case "invoice-processor":
        return JSON.stringify({
          document: "base64-encoded-pdf-data",
          extractFields: ["amount", "date", "vendor", "lineItems"]
        }, null, 2);
      case "email-sorter":
        return JSON.stringify({
          emails: [
            { id: "1", subject: "Urgent: Payment Required", from: "vendor@example.com" },
            { id: "2", subject: "Weekly Newsletter", from: "marketing@example.com" }
          ],
          categories: ["urgent", "marketing", "support"]
        }, null, 2);
      case "data-entry":
        return JSON.stringify({
          fields: [
            { name: "customer_name", value: "John Doe" },
            { name: "email", value: "john@example.com" },
            { name: "amount", value: "1250.00" }
          ]
        }, null, 2);
      default:
        return "{}";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`agent-card-${agent.type}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconClass}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {agent.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">{agent.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{agent.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Price:</span>
            <span className="font-medium">${agent.pricePerTask} per task</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Token Price:</span>
            <span className="font-medium">${agent.pricePerToken} per 1K tokens</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completed Today:</span>
            <span className="font-medium">{agent.totalTasksCompleted} tasks</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1" 
                disabled={!agent.isActive}
                data-testid={`button-start-task-${agent.type}`}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Start {agent.name} Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStartTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={taskData.department} onValueChange={(value) => setTaskData({...taskData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project (Optional)</Label>
                  <Input
                    id="project"
                    placeholder="e.g., Q1-2024"
                    value={taskData.project}
                    onChange={(e) => setTaskData({...taskData, project: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input">Task Input (JSON)</Label>
                  <Textarea
                    id="input"
                    placeholder={getExampleInput()}
                    value={taskData.input}
                    onChange={(e) => setTaskData({...taskData, input: e.target.value})}
                    rows={8}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide task input as JSON. See placeholder for example format.
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? "Starting..." : "Start Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="sm"
            data-testid={`button-details-${agent.type}`}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
