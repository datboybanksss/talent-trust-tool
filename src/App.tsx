import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LifeFile from "./pages/LifeFile";

import Documents from "./pages/Documents";
import Compliance from "./pages/Compliance";
import Advisors from "./pages/Advisors";
import Emails from "./pages/Emails";
import Reminders from "./pages/Reminders";
import Sharing from "./pages/Sharing";
import SocialMedia from "./pages/SocialMedia";
import ClientType from "./pages/ClientType";
import PropertyInvestments from "./pages/PropertyInvestments";
import FranchiseInvestments from "./pages/FranchiseInvestments";
import FinancialOverviewPage from "./pages/FinancialOverview";
import MonthlyBudgetPage from "./pages/MonthlyBudget";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/life-file" element={<ProtectedRoute><LifeFile /></ProtectedRoute>} />
            
            <Route path="/dashboard/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/dashboard/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
            <Route path="/dashboard/advisors" element={<ProtectedRoute><Advisors /></ProtectedRoute>} />
            <Route path="/dashboard/emails" element={<ProtectedRoute><Emails /></ProtectedRoute>} />
            <Route path="/dashboard/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/dashboard/sharing" element={<ProtectedRoute><Sharing /></ProtectedRoute>} />
            <Route path="/dashboard/social-media" element={<ProtectedRoute><SocialMedia /></ProtectedRoute>} />
            <Route path="/dashboard/property-investments" element={<ProtectedRoute><PropertyInvestments /></ProtectedRoute>} />
            <Route path="/dashboard/franchise-investments" element={<ProtectedRoute><FranchiseInvestments /></ProtectedRoute>} />
            <Route path="/dashboard/financial" element={<ProtectedRoute><FinancialOverviewPage /></ProtectedRoute>} />
            <Route path="/dashboard/budget" element={<ProtectedRoute><MonthlyBudgetPage /></ProtectedRoute>} />
            <Route path="/client-type" element={<ClientType />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
