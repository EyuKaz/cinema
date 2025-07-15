import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Movies from "@/pages/Movies";
import MovieDetails from "@/pages/MovieDetails";
import Theaters from "@/pages/Theaters";
import Booking from "@/pages/Booking";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/faq" component={FAQ} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/movies" component={Movies} />
          <Route path="/movie/:id" component={MovieDetails} />
          <Route path="/theaters" component={Theaters} />
          <Route path="/booking/:showtimeId" component={Booking} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/faq" component={FAQ} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
