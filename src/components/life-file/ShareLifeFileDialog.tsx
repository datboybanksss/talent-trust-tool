import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ACCESS_LEVELS, 
  SHARE_RELATIONSHIPS, 
  SHARE_SECTIONS,
  LifeFileShare 
} from "@/services/lifeFileShareService";
import { Loader2, Shield, Users, FileText, Phone } from "lucide-react";

const shareSchema = z.object({
  shared_with_email: z.string().email("Valid email required"),
  relationship: z.string().min(1, "Relationship is required"),
  access_level: z.string().min(1, "Access level is required"),
  sections: z.array(z.string()).min(1, "Select at least one section"),
  message: z.string().max(500).optional(),
  expires_at: z.string().optional(),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareLifeFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShareFormData) => Promise<void>;
  existingShare?: LifeFileShare | null;
}

const ShareLifeFileDialog = ({
  open,
  onOpenChange,
  onSubmit,
  existingShare,
}: ShareLifeFileDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      shared_with_email: existingShare?.shared_with_email || "",
      relationship: existingShare?.relationship || "",
      access_level: existingShare?.access_level || "view",
      sections: existingShare?.sections || ["beneficiaries", "contacts", "documents"],
      message: existingShare?.message || "",
      expires_at: existingShare?.expires_at?.split("T")[0] || "",
    },
  });

  const handleSubmit = async (data: ShareFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "beneficiaries":
        return Users;
      case "contacts":
        return Phone;
      case "documents":
        return FileText;
      default:
        return Shield;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {existingShare ? "Edit Share Access" : "Share Life File"}
          </DialogTitle>
          <DialogDescription>
            Grant trusted individuals access to your estate planning information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shared_with_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="attorney@lawfirm.com" 
                      {...field} 
                      disabled={!!existingShare}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SHARE_RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel} value={rel}>
                            {rel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="access_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACCESS_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sections"
              render={() => (
                <FormItem>
                  <FormLabel>Sections to Share *</FormLabel>
                  <FormDescription>
                    Select which parts of your Life File to share
                  </FormDescription>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {SHARE_SECTIONS.map((section) => {
                      const Icon = getSectionIcon(section.value);
                      return (
                        <FormField
                          key={section.value}
                          control={form.control}
                          name="sections"
                          render={({ field }) => (
                            <FormItem
                              className="flex items-center space-x-2 space-y-0 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(section.value)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, section.value]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== section.value));
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {section.label}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave empty for permanent access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note for the recipient..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {existingShare ? "Update Share" : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLifeFileDialog;
