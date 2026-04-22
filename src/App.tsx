import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AgentRoute from "@/components/AgentRoute";
import AdminRoute from "@/components/AdminRoute";
import Landing from "./pages/Landing";
import AgentRegister from "./pages/AgentRegister";
import AgentDashboard from "./pages/AgentDashboard";
import AgentClientDetail from "./pages/AgentClientDetail";
import AgentAthleteProfile from "./pages/AgentAthleteProfile";
import ActivateProfile from "./pages/ActivateProfile";
import StaffActivate from "./pages/StaffActivate";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
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


import MonthlyBudgetPage from "./pages/MonthlyBudget";
import { Navigate } from "react-router-dom";
import ApplyForFunding from "./pages/ApplyForFunding";
import ContractManager from "./pages/ContractManager";
import EndorsementTracker from "./pages/EndorsementTracker";
import RoyaltyTracker from "./pages/RoyaltyTracker";
import CreativePortfolio from "./pages/CreativePortfolio";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import EstateCalculator from "./pages/EstateCalculator";
import GuardianManagement from "./pages/GuardianManagement";
import FinancialIntegrations from "./pages/FinancialIntegrations";
import MyAgency from "./pages/MyAgency";
import AgentAccount from "./pages/AgentAccount";

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
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/agent-register" element={<AgentRegister />} />
            <Route path="/agent-dashboard" element={<AgentRoute><AgentDashboard /></AgentRoute>} />
            <Route path="/agent-dashboard/client/:clientId" element={<AgentRoute><AgentClientDetail /></AgentRoute>} />
            <Route path="/agent-dashboard/athlete/:athleteId" element={<AgentRoute><AgentAthleteProfile /></AgentRoute>} />
            <Route path="/myagency" element={<AgentRoute><MyAgency /></AgentRoute>} />
            <Route path="/agent-account" element={<AgentRoute><AgentAccount /></AgentRoute>} />
            <Route path="/activate/:token" element={<ActivateProfile />} />
            <Route path="/client-activate/:token" element={<ActivateProfile />} />
            <Route path="/staff-activate/:token" element={<StaffActivate />} />
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
            
            
            <Route path="/dashboard/payslip-tax" element={<Navigate to="/dashboard/documents" replace />} />
            <Route path="/dashboard/budget" element={<ProtectedRoute><MonthlyBudgetPage /></ProtectedRoute>} />
            <Route path="/dashboard/apply-for-funding" element={<ProtectedRoute><ApplyForFunding /></ProtectedRoute>} />
            <Route path="/dashboard/contracts" element={<ProtectedRoute><ContractManager /></ProtectedRoute>} />
            <Route path="/dashboard/endorsements" element={<ProtectedRoute><EndorsementTracker /></ProtectedRoute>} />
            <Route path="/dashboard/royalties" element={<ProtectedRoute><RoyaltyTracker /></ProtectedRoute>} />
            <Route path="/dashboard/creative-portfolio" element={<ProtectedRoute><CreativePortfolio /></ProtectedRoute>} />
            <Route path="/client-type" element={<ClientType />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/executive-overview" element={<ProtectedRoute><ExecutiveOverview /></ProtectedRoute>} />
            <Route path="/dashboard/estate-calculator" element={<ProtectedRoute><EstateCalculator /></ProtectedRoute>} />
            <Route path="/dashboard/guardian" element={<ProtectedRoute><GuardianManagement /></ProtectedRoute>} />
            <Route path="/dashboard/integrations" element={<ProtectedRoute><FinancialIntegrations /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
