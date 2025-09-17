import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AgentCard from "@/components/AgentCard";

export default function Marketplace() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: pricing } = useQuery({
    queryKey: ["/api/pricing"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">AI Agent Marketplace</h2>
          <p className="text-muted-foreground">Choose from our specialized AI agents for your business tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            Array.isArray(agents) ? agents.map((agent: any) => (
              <AgentCard key={agent.id} agent={agent} />
            )) : null
          )}
        </div>

        {/* Volume Discounts Info */}
        <Card className="bg-accent">
          <CardHeader>
            <CardTitle>Volume Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center" data-testid="discount-tier-1">
                <div className="text-2xl font-bold text-primary mb-1">5%</div>
                <div className="text-sm text-muted-foreground">100+ tasks/day</div>
              </div>
              <div className="text-center" data-testid="discount-tier-2">
                <div className="text-2xl font-bold text-primary mb-1">10%</div>
                <div className="text-sm text-muted-foreground">1,000+ tasks/day</div>
              </div>
              <div className="text-center" data-testid="discount-tier-3">
                <div className="text-2xl font-bold text-primary mb-1">20%</div>
                <div className="text-sm text-muted-foreground">10,000+ tasks/day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
