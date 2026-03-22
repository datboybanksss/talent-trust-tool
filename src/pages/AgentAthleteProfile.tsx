import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, User, Briefcase, Accessibility, Activity,
  HeartPulse, DollarSign, Megaphone, Plane, FolderOpen,
  Shield, Menu
} from "lucide-react";
import { mockAthleteProfiles } from "@/data/mockAthleteProfiles";
import { ProfileRole, canAccessSection } from "@/types/athleteProfile";
import PersonalInfoSection from "@/components/agent/athlete-profile/PersonalInfoSection";
import RepresentationSection from "@/components/agent/athlete-profile/RepresentationSection";
import ParaAthleteSection from "@/components/agent/athlete-profile/ParaAthleteSection";
import AthleticSection from "@/components/agent/athlete-profile/AthleticSection";
import HealthWelfareSection from "@/components/agent/athlete-profile/HealthWelfareSection";
import CommercialSection from "@/components/agent/athlete-profile/CommercialSection";
import MediaBrandSection from "@/components/agent/athlete-profile/MediaBrandSection";
import TravelSection from "@/components/agent/athlete-profile/TravelSection";
import DocumentVaultSection from "@/components/agent/athlete-profile/DocumentVaultSection";
import AccessConsentSection from "@/components/agent/athlete-profile/AccessConsentSection";

const tabs = [
  { id: "personal", label: "Personal", icon: User, section: "personal" },
  { id: "representation", label: "Representation", icon: Briefcase, section: "representation" },
  { id: "para_athlete", label: "Para-Athlete", icon: Accessibility, section: "para_athlete" },
  { id: "athletic", label: "Athletic", icon: Activity, section: "athletic" },
  { id: "health", label: "Health", icon: HeartPulse, section: "health" },
  { id: "commercial", label: "Commercial", icon: DollarSign, section: "commercial" },
  { id: "media", label: "Media", icon: Megaphone, section: "media" },
  { id: "travel", label: "Travel", icon: Plane, section: "travel" },
  { id: "documents", label: "Documents", icon: FolderOpen, section: "documents" },
  { id: "access", label: "Access & Consent", icon: Shield, section: "*" },
];

const AgentAthleteProfile = () => {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<ProfileRole>("agent");
  const [activeTab, setActiveTab] = useState("personal");

  // Find athlete profile by id, default to first
  const athlete = mockAthleteProfiles.find((a) => a.id === athleteId) || mockAthleteProfiles[0];

  const visibleTabs = tabs.filter((t) => {
    if (t.id === "access") return currentRole === "agent";
    if (t.id === "para_athlete" && !athlete.paraAthlete.enabled) return currentRole === "agent"; // show toggle for agent
    return canAccessSection(currentRole, t.section);
  });

  // If active tab is hidden, reset
  if (!visibleTabs.find((t) => t.id === activeTab)) {
    setActiveTab(visibleTabs[0]?.id || "personal");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agent-dashboard")} className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  {athlete.personal.firstName} {athlete.personal.lastName}
                </h1>
                {athlete.paraAthlete.enabled && (
                  <Badge className="bg-info/15 text-info border-0 text-xs">
                    <Accessibility className="w-3 h-3 mr-1" /> Para-Athlete
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{athlete.athletic.sport}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {athlete.athletic.currentTeam || athlete.athletic.discipline} · {athlete.personal.nationality}
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Profile</span>
                <span className="text-sm font-bold text-foreground">{athlete.profileCompleteness}%</span>
              </div>
              <Progress value={athlete.profileCompleteness} className="w-32 h-1.5" />
            </div>
          </div>

          {/* Role indicator */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Viewing as:</span>
              <Badge variant="secondary" className="text-xs capitalize">{currentRole}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">Last updated: {athlete.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <ScrollArea className="w-full mb-6">
            <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-xl w-auto">
              {visibleTabs.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg whitespace-nowrap"
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="personal">
            <PersonalInfoSection data={athlete.personal} />
          </TabsContent>
          <TabsContent value="representation">
            <RepresentationSection data={athlete.representation} />
          </TabsContent>
          <TabsContent value="para_athlete">
            <ParaAthleteSection data={athlete.paraAthlete} />
          </TabsContent>
          <TabsContent value="athletic">
            <AthleticSection data={athlete.athletic} />
          </TabsContent>
          <TabsContent value="health">
            <HealthWelfareSection data={athlete.health} />
          </TabsContent>
          <TabsContent value="commercial">
            <CommercialSection data={athlete.commercial} />
          </TabsContent>
          <TabsContent value="media">
            <MediaBrandSection data={athlete.media} />
          </TabsContent>
          <TabsContent value="travel">
            <TravelSection data={athlete.travel} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentVaultSection data={athlete.documents} />
          </TabsContent>
          <TabsContent value="access">
            <AccessConsentSection consents={athlete.consents} currentRole={currentRole} onRoleChange={setCurrentRole} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentAthleteProfile;
