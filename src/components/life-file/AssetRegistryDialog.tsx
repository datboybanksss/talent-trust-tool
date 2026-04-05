import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LifeFileAsset,
  INSURANCE_TYPES,
  INVESTMENT_TYPES,
  PREMIUM_FREQUENCIES,
} from "@/types/lifeFileAsset";

interface AssetRegistryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  asset?: LifeFileAsset | null;
  defaultCategory?: "insurance" | "investment";
}

const AssetRegistryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  asset,
  defaultCategory = "insurance",
}: AssetRegistryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"insurance" | "investment">(defaultCategory);
  const [assetType, setAssetType] = useState("");
  const [institution, setInstitution] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [premium, setPremium] = useState("");
  const [premiumFrequency, setPremiumFrequency] = useState("monthly");
  const [beneficiaryNames, setBeneficiaryNames] = useState("");
  const [beneficiaryAllocation, setBeneficiaryAllocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (asset) {
      setCategory(asset.asset_category as "insurance" | "investment");
      setAssetType(asset.asset_type);
      setInstitution(asset.institution);
      setPolicyNumber(asset.policy_or_account_number || "");
      setDescription(asset.description || "");
      setAmount(String(asset.amount || ""));
      setCurrency(asset.currency);
      setPremium(String(asset.premium_or_contribution || ""));
      setPremiumFrequency(asset.premium_frequency || "monthly");
      setBeneficiaryNames(asset.beneficiary_names || "");
      setBeneficiaryAllocation(asset.beneficiary_allocation || "");
      setStartDate(asset.start_date || "");
      setMaturityDate(asset.maturity_or_expiry_date || "");
      setStatus(asset.status);
      setNotes(asset.notes || "");
    } else {
      setCategory(defaultCategory);
      setAssetType("");
      setInstitution("");
      setPolicyNumber("");
      setDescription("");
      setAmount("");
      setCurrency("ZAR");
      setPremium("");
      setPremiumFrequency("monthly");
      setBeneficiaryNames("");
      setBeneficiaryAllocation("");
      setStartDate("");
      setMaturityDate("");
      setStatus("active");
      setNotes("");
    }
  }, [asset, open, defaultCategory]);

  const typeOptions = category === "insurance" ? INSURANCE_TYPES : INVESTMENT_TYPES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !assetType) return;
    setLoading(true);
    try {
      await onSubmit({
        asset_category: category,
        asset_type: assetType,
        institution,
        policy_or_account_number: policyNumber || null,
        description: description || null,
        amount: parseFloat(amount) || 0,
        currency,
        premium_or_contribution: parseFloat(premium) || null,
        premium_frequency: premiumFrequency,
        beneficiary_names: beneficiaryNames || null,
        beneficiary_allocation: beneficiaryAllocation || null,
        start_date: startDate || null,
        maturity_or_expiry_date: maturityDate || null,
        status,
        notes: notes || null,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Edit" : "Add"} {category === "insurance" ? "Insurance Policy" : "Investment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v as any); setAssetType(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={assetType} onValueChange={setAssetType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institution / Provider *</Label>
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Old Mutual, Sanlam" required />
            </div>
            <div className="space-y-2">
              <Label>{category === "insurance" ? "Policy Number" : "Account Number"}</Label>
              <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g. POL-123456" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this policy/investment" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{category === "insurance" ? "Cover Amount" : "Current Value"}</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZAR">ZAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{category === "insurance" ? "Premium" : "Contribution"}</Label>
              <Input type="number" value={premium} onChange={(e) => setPremium(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={premiumFrequency} onValueChange={setPremiumFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PREMIUM_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start / Inception Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{category === "insurance" ? "Expiry Date" : "Maturity Date"}</Label>
              <Input type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Beneficiary Name(s)</Label>
              <Input value={beneficiaryNames} onChange={(e) => setBeneficiaryNames(e.target.value)} placeholder="e.g. Jane Doe, John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Beneficiary Allocation</Label>
              <Input value={beneficiaryAllocation} onChange={(e) => setBeneficiaryAllocation(e.target.value)} placeholder="e.g. 50%, 50%" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                  <SelectItem value="paid_up">Paid Up</SelectItem>
                  <SelectItem value="matured">Matured</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !institution || !assetType}>
              {loading ? "Saving..." : asset ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetRegistryDialog;
