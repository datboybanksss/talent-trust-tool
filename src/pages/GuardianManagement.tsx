import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, ScrollText, History, Scale } from "lucide-react";
import GuardianOverviewTab from "@/components/guardian/GuardianOverviewTab";
import GuardianAccessTab from "@/components/guardian/GuardianAccessTab";
import ConsentRecordsTab from "@/components/guardian/ConsentRecordsTab";
import AuditLogTab from "@/components/guardian/AuditLogTab";
import DataRightsTab from "@/components/guardian/DataRightsTab";

const GuardianManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Guardian & Minor Protection
          </h1>
          <p className="text-muted-foreground mt-1">
            GDPR & POPIA-compliant guardian access management for minors
          </p>
        </div>

        {/* Age-appropriate transparency notice */}
        <div className="bg-info/10 border border-info/30 rounded-xl p-4">
          <p className="text-sm text-foreground font-medium mb-1">🛡️ Your Privacy Matters</p>
          <p className="text-xs text-muted-foreground">
            This page helps you control who can see parts of your profile. A guardian (like a parent) can only <strong>look at</strong> the sections you allow — they <strong>cannot change, delete, or share</strong> anything. You can remove their access at any time. When you turn 18, all guardian access is automatically removed.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="guardians" className="flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" /> Guardians
            </TabsTrigger>
            <TabsTrigger value="consents" className="flex items-center gap-1.5 text-xs">
              <ScrollText className="w-3.5 h-3.5" /> Consents
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1.5 text-xs">
              <History className="w-3.5 h-3.5" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="rights" className="flex items-center gap-1.5 text-xs">
              <Scale className="w-3.5 h-3.5" /> My Rights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><GuardianOverviewTab /></TabsContent>
          <TabsContent value="guardians"><GuardianAccessTab /></TabsContent>
          <TabsContent value="consents"><ConsentRecordsTab /></TabsContent>
          <TabsContent value="audit"><AuditLogTab /></TabsContent>
          <TabsContent value="rights"><DataRightsTab /></TabsContent>
        </Tabs>

        {/* Mandatory disclaimer */}
        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed max-w-3xl mx-auto">
          This feature is designed to comply with GDPR Articles 6 & 8, POPIA Section 35, and the SA Children's Act. Guardian access is strictly limited to oversight purposes. All actions are logged and auditable. Automatic revocation occurs at age of majority (18). This does not constitute legal advice — consult a qualified legal professional for your specific circumstances.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default GuardianManagement;
