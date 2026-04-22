import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";

const FirstLoginWelcomeCard = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [docCount, setDocCount] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, first_login_seen_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile || profile.first_login_seen_at) return;
      setName(profile.display_name?.split(" ")[0] ?? "there");

      const { count } = await supabase
        .from("life_file_documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .ilike("notes", "Pre-loaded by your agent%");
      setDocCount(count ?? 0);
      setShow(true);
    };
    load();
  }, [user]);

  const dismiss = async () => {
    if (!user) return;
    setDismissing(true);
    await supabase
      .from("profiles")
      .update({ first_login_seen_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setShow(false);
  };

  if (!show) return null;

  return (
    <Card className="mb-6 border-gold/40 bg-gradient-to-r from-gold/10 to-primary/5 shadow-soft">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-display font-semibold text-foreground">
              Welcome to Legacy Builder, {name}!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {docCount > 0
                ? `Your agent has uploaded ${docCount} document${docCount === 1 ? "" : "s"} to get you started. Here are your next three steps:`
                : "Here are your next three steps to secure your legacy:"}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground">
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-border inline-block" /> Upload any additional personal documents</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-border inline-block" /> Add at least one beneficiary</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-border inline-block" /> Add an emergency contact</li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button size="sm" asChild>
                <Link to="/dashboard/life-file">Get started</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss} disabled={dismissing}>
                <X className="w-4 h-4 mr-1" /> Dismiss for now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirstLoginWelcomeCard;
