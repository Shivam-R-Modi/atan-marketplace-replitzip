import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocs() {
  const [newKeyName, setNewKeyName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: apiKeys } = useQuery({
    queryKey: ["/api/keys"],
  });

  const { data: pricing } = useQuery({
    queryKey: ["/api/pricing"],
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/keys", { name });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Created",
        description: `Key: ${data.key}`,
      });
      setNewKeyName("");
    },
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim()) {
      createKeyMutation.mutate(newKeyName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">API Documentation</h2>
          <p className="text-muted-foreground">Integrate ATAN agents into your applications</p>
        </div>

        {/* API Key Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {apiKeys?.map((apiKey: any) => (
                <div key={apiKey.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <div className="font-mono text-sm">{apiKey.keyPrefix}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleCopyKey(apiKey.keyPrefix)}
                      data-testid={`button-copy-key-${apiKey.id}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateKey} className="flex gap-2">
              <Input
                placeholder="API Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                data-testid="input-api-key-name"
              />
              <Button 
                type="submit" 
                disabled={createKeyMutation.isPending}
                data-testid="button-create-api-key"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New API Key
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground mb-2"># Install SDK</div>
                <div>npm install @atan/sdk</div>
                <div className="mt-4 text-muted-foreground mb-2"># Initialize</div>
                <div>const atan = new ATAN('atan_sk_live_...');</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Per Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice Processor API:</span>
                  <span className="font-medium">$0.05 + tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email Sorter API:</span>
                  <span className="font-medium">$0.03 + tokens</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Entry API:</span>
                  <span className="font-medium">$0.02 + tokens</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints Documentation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">POST</Badge>
                  <code className="text-sm">/api/tasks</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Process a task with any agent</p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {JSON.stringify({
                    agentId: "agent-uuid",
                    input: { document: "base64-data" },
                    department: "Finance",
                    project: "Q1-2024"
                  }, null, 2)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/tasks</code>
                </div>
                <p className="text-sm text-muted-foreground">Get your task history</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/agents</code>
                </div>
                <p className="text-sm text-muted-foreground">List available agents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Process Invoice</h4>
                <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                  <div className="text-green-600">// Process an invoice document</div>
                  <div className="mt-2">const result = await atan.invoiceProcessor</div>
                  <div>  .process({`{`}</div>
                  <div>    document: invoiceFile,</div>
                  <div>    department: 'Finance',</div>
                  <div>    project: 'Q1-2024'</div>
                  <div>  {`}`});</div>
                  <div className="mt-2 text-muted-foreground">// Returns extracted data + cost</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Sort Emails</h4>
                <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                  <div className="text-green-600">// Sort and classify emails</div>
                  <div className="mt-2">const result = await atan.emailSorter</div>
                  <div>  .sort({`{`}</div>
                  <div>    emails: emailBatch,</div>
                  <div>    categories: ['urgent', 'normal'],</div>
                  <div>    department: 'Marketing'</div>
                  <div>  {`}`});</div>
                  <div className="mt-2 text-muted-foreground">// Returns sorted emails + cost</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
