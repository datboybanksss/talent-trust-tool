import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetItem, LiabilityItem, formatZAR, computeGrossEstate, computeTotalLiabilities, computeNetEstate } from "@/utils/estateCalculations";
import { Plus, Trash2, Building2, Wallet } from "lucide-react";

interface Props {
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  onAssetsChange: (assets: AssetItem[]) => void;
  onLiabilitiesChange: (liabilities: LiabilityItem[]) => void;
}

const assetTypes = [
  { value: 'residential-property', label: 'Residential Property' },
  { value: 'investment-property', label: 'Investment Property' },
  { value: 'cash-savings', label: 'Cash & Savings' },
  { value: 'investments', label: 'Investments' },
  { value: 'royalties-capitalised', label: 'Royalties (Capitalised)' },
  { value: 'business-interests', label: 'Business Interests (Image Rights, Production)' },
  { value: 'loan-accounts', label: 'Loan Accounts' },
  { value: 'life-policies-estate', label: 'Life Policies Payable to Estate' },
];

const liabilityTypes = [
  { value: 'home-loan', label: 'Home Loan' },
  { value: 'vehicle-finance', label: 'Vehicle Finance' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'lifestyle-debt', label: 'Lifestyle Debt' },
  { value: 'tax-liabilities', label: 'Tax Liabilities' },
  { value: 'business-guarantees', label: 'Business Guarantees & Sureties' },
  { value: 'funeral-costs', label: 'Funeral Costs' },
];

const AssetsLiabilitiesSection: React.FC<Props> = ({ assets, liabilities, onAssetsChange, onLiabilitiesChange }) => {
  const addAsset = () => {
    onAssetsChange([...assets, { id: crypto.randomUUID(), type: 'cash-savings', description: '', value: 0 }]);
  };

  const addLiability = () => {
    onLiabilitiesChange([...liabilities, { id: crypto.randomUUID(), type: 'personal-loan', description: '', value: 0 }]);
  };

  const updateAsset = (id: string, field: keyof AssetItem, value: any) => {
    onAssetsChange(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const updateLiability = (id: string, field: keyof LiabilityItem, value: any) => {
    onLiabilitiesChange(liabilities.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const grossEstate = computeGrossEstate(assets);
  const totalLiab = computeTotalLiabilities(liabilities);
  const netEstate = computeNetEstate(assets, liabilities);

  return (
    <div className="space-y-6">
      {/* Assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Estate Assets
          </CardTitle>
          <Button size="sm" onClick={addAsset}><Plus className="w-4 h-4 mr-1" /> Add Asset</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {assets.map(asset => (
            <div key={asset.id} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={asset.type} onValueChange={v => updateAsset(asset.id, 'type', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {assetTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input className="h-9" value={asset.description} onChange={e => updateAsset(asset.id, 'description', e.target.value)} placeholder="Description" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value (R)</Label>
                <Input className="h-9" type="number" value={asset.value || ''} onChange={e => updateAsset(asset.id, 'value', Number(e.target.value))} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onAssetsChange(assets.filter(a => a.id !== asset.id))}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {assets.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No assets added. Click "Add Asset" to begin.</p>}
        </CardContent>
      </Card>

      {/* Liabilities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-destructive" /> Liabilities & Obligations
          </CardTitle>
          <Button size="sm" onClick={addLiability}><Plus className="w-4 h-4 mr-1" /> Add Liability</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {liabilities.map(liability => (
            <div key={liability.id} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={liability.type} onValueChange={v => updateLiability(liability.id, 'type', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {liabilityTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input className="h-9" value={liability.description} onChange={e => updateLiability(liability.id, 'description', e.target.value)} placeholder="Description" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value (R)</Label>
                <Input className="h-9" type="number" value={liability.value || ''} onChange={e => updateLiability(liability.id, 'value', Number(e.target.value))} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onLiabilitiesChange(liabilities.filter(l => l.id !== liability.id))}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Gross Estate</p>
              <p className="text-xl font-bold text-foreground">{formatZAR(grossEstate)}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/5">
              <p className="text-sm text-muted-foreground">Total Liabilities</p>
              <p className="text-xl font-bold text-destructive">{formatZAR(totalLiab)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground">Net Estate</p>
              <p className={`text-xl font-bold ${netEstate >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{formatZAR(netEstate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsLiabilitiesSection;
