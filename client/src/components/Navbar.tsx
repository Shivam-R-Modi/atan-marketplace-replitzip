import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Plus, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addCreditsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", "/api/billing/add-credits", { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Credits added",
        description: "Your account has been topped up successfully.",
      });
    },
  });

  const navItems = [
    { path: "/dashboard", label: "Dashboard", id: "dashboard" },
    { path: "/marketplace", label: "Marketplace", id: "marketplace" },
    { path: "/analytics", label: "Analytics", id: "analytics" },
    { path: "/billing", label: "Billing", id: "billing" },
    { path: "/api", label: "API", id: "api" },
  ];

  const handleAddCredits = () => {
    addCreditsMutation.mutate(100); // Add $100 by default
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-primary">
                ATAN
              </Link>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.id} href={item.path}>
                    <a
                      data-testid={`nav-${item.id}`}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm">
                Credits: <span className="font-semibold text-primary">${user.creditsBalance || "0.00"}</span>
              </div>
            )}
            <Button
              onClick={handleAddCredits}
              disabled={addCreditsMutation.isPending}
              size="sm"
              data-testid="button-add-credits"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Credits
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-secondary-foreground" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
