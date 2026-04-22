import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { useAgencyScope } from "@/hooks/useAgencyScope";

interface Props {
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  className?: string;
}

/**
 * Small attribution chip for workspace-scoped records (deals, invitations,
 * meetings). Shows "Added by Naledi Ntsane (PA) · 2 hours ago" with a tooltip
 * for the absolute timestamp and the last-updated info if present.
 */
export const RecordAttribution = ({
  createdBy, createdAt, updatedBy, updatedAt, className = "",
}: Props) => {
  const { scopedAgentId } = useAgencyScope();
  const { resolve } = useWorkspaceMembers(scopedAgentId);
  if (!createdBy && !createdAt) return null;
  const author = resolve(createdBy);
  const editor = updatedBy && updatedBy !== createdBy ? resolve(updatedBy) : null;

  const ago = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "";
  const tooltip = [
    createdAt ? `Added: ${new Date(createdAt).toLocaleString()}` : null,
    updatedAt && updatedAt !== createdAt ? `Updated: ${new Date(updatedAt).toLocaleString()}` : null,
    editor ? `Last edited by ${editor.name} (${editor.role})` : null,
  ].filter(Boolean).join("\n");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1.5 text-[10px] text-muted-foreground ${className}`}>
            Added by <span className="font-medium text-foreground">{author.name}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">{author.role}</Badge>
            {ago && <span>· {ago}</span>}
            {editor && <span className="italic">· edited</span>}
          </span>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <pre className="text-[10px] whitespace-pre-line">{tooltip}</pre>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default RecordAttribution;