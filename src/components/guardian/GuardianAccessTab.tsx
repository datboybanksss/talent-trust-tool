import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import InviteGuardianDialog from "./InviteGuardianDialog";

const GuardianAccessTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Guardian Access</h2>
          <p className="text-xs text-muted-foreground">Manage who has oversight of your profile</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Invite Guardian
        </Button>
      </div>

      <InviteGuardianDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <Card className="border-border border-dashed">
        <CardContent className="py-12 text-center space-y-2">
          <Users className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">No guardians yet</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Invite a parent, legal guardian, or court-appointed representative to oversee permitted sections of your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianAccessTab;
