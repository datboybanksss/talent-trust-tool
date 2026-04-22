import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
}

const DeleteAgencyDialog = ({ open, onOpenChange, companyName }: Props) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orphanRef, setOrphanRef] = useState<string | null>(null);

  const matches = confirm === companyName;

  const reset = () => {
    setConfirm("");
    setOrphanRef(null);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setOrphanRef(null);
    const { data, error } = await supabase.functions.invoke("delete-agent-account");
    setSubmitting(false);

    if (error) {
      // Try to read structured error body from edge function
      const ctx = (error as { context?: Response }).context;
      let body: { error?: string; orphaned?: boolean; reference?: string; message?: string } = {};
      try { body = ctx ? await ctx.json() : {}; } catch { /* ignore */ }

      if (body.orphaned && body.reference) {
        setOrphanRef(body.reference);
        return;
      }
      if (body.error === "demo_account") {
        toast({ title: "Demo accounts cannot be deleted from the UI.", variant: "destructive" });
        return;
      }
      toast({
        title: "Delete failed",
        description: body.message ?? error.message,
        variant: "destructive",
      });
      return;
    }

    if (data?.success) {
      toast({ title: "Agency account deleted" });
      await signOut();
      navigate("/");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete your agency account?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>This permanently deletes:</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>Your agency profile and logo</li>
                <li>Invitations you sent to clients</li>
                <li>Share grants you received from clients</li>
                <li>Staff portal access you granted</li>
                <li>Your agent role and login</li>
              </ul>
              <p>This does <strong>NOT</strong> delete:</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li>Your clients, their Life Files, or their documents</li>
                <li>Your clients' independent accounts</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label className="text-xs">Type your company name to confirm: <span className="font-mono">{companyName}</span></Label>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={submitting} />
        </div>

        {orphanRef && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs">
            <p className="font-medium text-destructive">Auth cleanup failed.</p>
            <p className="text-muted-foreground mt-1">
              Your agency data was removed but your login still exists. Contact support with reference{" "}
              <span className="font-mono">{orphanRef}</span>.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!matches || submitting}>
            {submitting && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            Delete permanently
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAgencyDialog;