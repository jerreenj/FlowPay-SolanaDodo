import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ModuleSelect from "@/pages/ModuleSelect";
import Dashboard from "@/pages/Dashboard";
import Payroll from "@/pages/Payroll";
import Remittance from "@/pages/Remittance";
import EscrowPage from "@/pages/Escrow";
import Creator from "@/pages/Creator";
import Agents from "@/pages/Agents";
import WalletPage from "@/pages/Wallet";
import Buy from "@/pages/Buy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/select">
        <ProtectedRoute component={ModuleSelect} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/payroll">
        <ProtectedRoute component={Payroll} />
      </Route>
      <Route path="/remittance">
        <ProtectedRoute component={Remittance} />
      </Route>
      <Route path="/escrow">
        <ProtectedRoute component={EscrowPage} />
      </Route>
      <Route path="/creator">
        <ProtectedRoute component={Creator} />
      </Route>
      <Route path="/agents">
        <ProtectedRoute component={Agents} />
      </Route>
      <Route path="/wallet">
        <ProtectedRoute component={WalletPage} />
      </Route>
      <Route path="/buy/:id" component={Buy} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
