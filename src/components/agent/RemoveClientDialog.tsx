import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationId: string | null;
  clientName: string;
  clientUserId: string | null; // activated_user_id; null if not yet activated
  isDemoClient?: boolean;
  onDone: () => void;
}

const RemoveClientDialog = ({
  open, onOpenChange, invitationId, clientName, clientUserId, isDemoClient, onDone,
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!user || !invitationId) return;
    setBusy(true);

    // 1. Revoke life-file share if the client is activated and a share exists.
    if (clientUserId) {
      const { error: shareErr } = await supabase
        .from("life_file_shares")
        .delete()
        .eq("shared_with_user_id", user.id)
        .eq("owner_id", clientUserId);
      if (shareErr) {
        setBusy(false);
        toast({ title: "Could not revoke access", description: shareErr.message, variant: "destructive" });
        return;
      }
    }

    // 2. Archive the invitation row (POPIA: never delete; preserve audit trail).
    const { error: archErr } = await supabase
      .from("client_invitations")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", invitationId)
      .eq("agent_id", user.id);

    setBusy(false);
    if (archErr) {
      toast({ title: "Could not archive invitation", description: archErr.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Client removed from roster",
      description: `${clientName} has been removed. Their account and data are unchanged.`,
    });
    onOpenChange(false);
    onDone();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {clientName} from your roster?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This will revoke your access to their profile and remove them from your client list.
              Their account and data remain intact — only your relationship with them is ended.
              They can re-invite you in future if they choose.
            </span>
            {isDemoClient && (
              <span className="block text-xs italic text-muted-foreground">
                Note: this is a demo client. Removing them from your roster does not re-seed automatically.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Removing…" : "Remove from roster"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveClientDialog;
