import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { BusinessProvider } from "@/hooks/useBusinessContext";
import NotFound from "@/pages/not-found";
import AppPage from "@/pages/app";
import BusinessPage from "@/pages/business/[slug]";
import DemoPage from "@/pages/demo";

function Router() {
  return (
    <Switch>
      {/* Home route redirects to app dashboard */}
      <Route path="/">
        {() => {
          window.location.href = "/app/dashboard";
          return null;
        }}
      </Route>
      
      {/* Demo access route */}
      <Route path="/demo/:token" component={DemoPage} />
      
      {/* Public marketing site route */}
      <Route path="/:slug" component={BusinessPage} />
      
      {/* Operator portal routes */}
      <Route path="/app" component={AppPage} />
      <Route path="/app/dashboard" component={AppPage} />
      <Route path="/app/messages" component={AppPage} />
      <Route path="/app/contacts" component={AppPage} />
      <Route path="/app/reviews" component={AppPage} />
      <Route path="/app/schedule" component={AppPage} />
      <Route path="/app/automations" component={AppPage} />
      <Route path="/app/website" component={AppPage} />
      <Route path="/app/settings" component={AppPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BusinessProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BusinessProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
