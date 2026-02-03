import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Journey from "./pages/Journey";
import Documents from "./pages/Documents";
import Compliance from "./pages/Compliance";
import Advisors from "./pages/Advisors";
import Emails from "./pages/Emails";
import Reminders from "./pages/Reminders";
import ClientType from "./pages/ClientType";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/journey" element={<Journey />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/compliance" element={<Compliance />} />
          <Route path="/dashboard/advisors" element={<Advisors />} />
          <Route path="/dashboard/emails" element={<Emails />} />
          <Route path="/dashboard/reminders" element={<Reminders />} />
          <Route path="/client-type" element={<ClientType />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
