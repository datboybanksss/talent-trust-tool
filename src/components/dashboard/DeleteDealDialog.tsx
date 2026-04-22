import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDealDialogProps {
  dealId: string | null;
  dealLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteDealDialog = ({ dealId, dealLabel, open, onOpenChange }: DeleteDealDialogProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!dealId) return;
    setLoading(true);
    const { error } = await supabase.from("agent_deals").delete().eq("id", dealId);
    setLoading(false);
    if (error) {
      toast.error("Failed to delete deal", { description: error.message });
      return;
    }
    toast.success("Deal deleted");
    queryClient.invalidateQueries({ queryKey: ["agent_deals"] });
    if (user) {
      await supabase.from("audit_log").insert({
        action: "deal_deleted",
        entity_type: "deal",
        entity_id: dealId,
        user_id: user.id,
        metadata: { label: dealLabel },
      });
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{dealLabel}</span> will be permanently
            removed from your pipeline. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Delete deal"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDealDialog;