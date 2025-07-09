import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "./contexts/BookingContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import MovieDetails from "@/pages/MovieDetails";
import BookingFlow from "@/pages/BookingFlow";
import UserDashboard from "@/pages/UserDashboard";
import CinemaOwnerDashboard from "@/pages/CinemaOwnerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/movie/:id" component={MovieDetails} />
          <Route path="/booking" component={BookingFlow} />
          <Route path="/dashboard" component={UserDashboard} />
          <Route path="/owner/dashboard" component={CinemaOwnerDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BookingProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </BookingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
