import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Upload, ShieldAlert, UserPlus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInYears } from "date-fns";
import { toast } from "sonner";
import {
  GUARDIAN_RELATIONSHIPS,
  ACCESS_LEVELS,
  SHAREABLE_SECTIONS,
  type GuardianRelationship,
  type GuardianAccessLevel,
} from "@/types/guardianAccess";

interface InviteGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VERIFICATION_METHODS = [
  { value: "id_document", label: "ID Document (e.g. passport, national ID)" },
  { value: "court_order", label: "Court Order" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "adoption_papers", label: "Adoption Papers" },
];

const InviteGuardianDialog = ({ open, onOpenChange }: InviteGuardianDialogProps) => {
  const [step, setStep] = useState(1);

  // Step 1: Minor's DOB + Declaration
  const [dob, setDob] = useState<Date>();
  const [declaredMinor, setDeclaredMinor] = useState(false);

  // Step 2: Guardian details
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationship, setRelationship] = useState<GuardianRelationship | "">("");
  const [accessLevel, setAccessLevel] = useState<GuardianAccessLevel>("view_only");

  // Step 3: Verification + Sections
  const [verificationMethod, setVerificationMethod] = useState("");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [purposeLimitation, setPurposeLimitation] = useState("");

  // Step 4: Confirmation
  const [coercionConfirm, setCoercionConfirm] = useState(false);
  const [transparencyAccepted, setTransparencyAccepted] = useState(false);

  const age = dob ? differenceInYears(new Date(), dob) : null;
  const isMinor = age !== null && age < 18;
  const totalSteps = 4;

  const resetForm = () => {
    setStep(1);
    setDob(undefined);
    setDeclaredMinor(false);
    setGuardianName("");
    setGuardianEmail("");
    setRelationship("");
    setAccessLevel("view_only");
    setVerificationMethod("");
    setVerificationFile(null);
    setSelectedSections([]);
    setPurposeLimitation("");
    setCoercionConfirm(false);
    setTransparencyAccepted(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const canProceedStep1 = dob && isMinor && declaredMinor;
  const canProceedStep2 = guardianName.trim() && guardianEmail.trim() && relationship;
  const canProceedStep3 = verificationMethod && selectedSections.length > 0 && purposeLimitation.trim();
  const canSubmit = coercionConfirm && transparencyAccepted;

  const handleSectionToggle = (sectionValue: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionValue) ? prev.filter((s) => s !== sectionValue) : [...prev, sectionValue]
    );
  };

  const handleSubmit = () => {
    toast.success(`Guardian invitation sent to ${guardianName} (${guardianEmail}). Pending verification.`);
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Guardian — Step {step} of {totalSteps}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Confirm your age to enable guardian access."}
            {step === 2 && "Enter your guardian's details."}
            {step === 3 && "Choose verification, sections, and purpose."}
            {step === 4 && "Review and confirm your invitation."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-colors",
                i < step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* ── Step 1: DOB + Declaration ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, "dd MMMM yyyy") : "Select your date of birth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    captionLayout="dropdown-buttons"
                    fromYear={2000}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {dob && (
                <p className="text-sm">
                  Age: <strong>{age}</strong> years{" "}
                  {isMinor ? (
                    <Badge variant="default" className="ml-1 text-xs">Minor</Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-1 text-xs">18+ — guardian access not applicable</Badge>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Checkbox
                id="declare-minor"
                checked={declaredMinor}
                onCheckedChange={(v) => setDeclaredMinor(v === true)}
                disabled={!isMinor}
              />
              <label htmlFor="declare-minor" className="text-sm leading-relaxed cursor-pointer">
                I confirm that I am under the age of 18 and I understand that inviting a guardian grants them <strong>read-only oversight</strong> of selected parts of my profile. I may revoke this access at any time.
              </label>
            </div>
          </div>
        )}

        {/* ── Step 2: Guardian Details ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardian-name">Guardian's Full Name</Label>
              <Input
                id="guardian-name"
                placeholder="e.g. Sarah Johnson"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardian-email">Guardian's Email Address</Label>
              <Input
                id="guardian-email"
                type="email"
                placeholder="e.g. parent@email.com"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={(v) => setRelationship(v as GuardianRelationship)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {GUARDIAN_RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as GuardianAccessLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      <div>
                        <span className="font-medium">{lvl.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {lvl.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* ── Step 3: Verification, Sections, Purpose ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Verification Method */}
            <div className="space-y-2">
              <Label>Verification Method</Label>
              <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="How will the guardian verify identity?" />
                </SelectTrigger>
                <SelectContent>
                  {VERIFICATION_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>Upload Supporting Document (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="verification-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="verification-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  {verificationFile ? (
                    <span className="text-sm text-foreground font-medium">{verificationFile.name}</span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Click to upload PDF, JPG, or PNG</span>
                      <span className="text-xs text-muted-foreground">Max 10 MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Section checkboxes */}
            <div className="space-y-2">
              <Label>Permitted Sections (data minimisation)</Label>
              <p className="text-xs text-muted-foreground mb-2">Only grant access to sections the guardian genuinely needs to oversee.</p>
              <div className="grid grid-cols-1 gap-2">
                {SHAREABLE_SECTIONS.map((sec) => (
                  <div key={sec.value} className="flex items-center gap-3 p-2 rounded-md border border-border hover:bg-muted/30 transition-colors">
                    <Checkbox
                      id={`sec-${sec.value}`}
                      checked={selectedSections.includes(sec.value)}
                      onCheckedChange={() => handleSectionToggle(sec.value)}
                    />
                    <label htmlFor={`sec-${sec.value}`} className="text-sm cursor-pointer flex-1">{sec.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Purpose Limitation */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose Limitation (required)</Label>
              <Textarea
                id="purpose"
                placeholder="Describe why this guardian needs access, e.g. 'Oversight of estate planning documents and emergency contacts for the minor child'"
                value={purposeLimitation}
                onChange={(e) => setPurposeLimitation(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{purposeLimitation.length}/500</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Confirm ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Review Your Invitation</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Guardian</p>
                  <p className="font-medium">{guardianName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{guardianEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Relationship</p>
                  <p className="font-medium capitalize">{relationship.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Access Level</p>
                  <p className="font-medium capitalize">{accessLevel.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="font-medium capitalize">{verificationMethod.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your DOB</p>
                  <p className="font-medium">{dob ? format(dob, "dd MMM yyyy") : "—"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Permitted Sections</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSections.map((s) => {
                    const label = SHAREABLE_SECTIONS.find((ss) => ss.value === s)?.label || s;
                    return <Badge key={s} variant="outline" className="text-xs">{label}</Badge>;
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Purpose Limitation</p>
                <p className="text-sm text-foreground">{purposeLimitation}</p>
              </div>

              {verificationFile && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Uploaded Document</p>
                  <p className="text-sm text-foreground">{verificationFile.name}</p>
                </div>
              )}
            </div>

            {/* Coercion safeguard */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
                <ShieldAlert className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Coercion Safeguard</p>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="coercion"
                      checked={coercionConfirm}
                      onCheckedChange={(v) => setCoercionConfirm(v === true)}
                    />
                    <label htmlFor="coercion" className="text-sm leading-relaxed cursor-pointer">
                      I confirm that I am inviting this guardian <strong>voluntarily</strong> and without pressure from any person. I understand I can revoke access at any time.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="transparency"
                    checked={transparencyAccepted}
                    onCheckedChange={(v) => setTransparencyAccepted(v === true)}
                  />
                  <label htmlFor="transparency" className="text-sm leading-relaxed cursor-pointer">
                    I understand that guardian access is time-bound and will be <strong>automatically revoked</strong> when I turn 18. All guardian actions are logged and auditable.
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <UserPlus className="w-4 h-4 mr-1" /> Send Invitation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteGuardianDialog;
