import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProtectionProduct, LongTermStructure, formatZAR } from "@/utils/estateCalculations";
import { Plus, Trash2, Shield, Landmark } from "lucide-react";

interface Props {
  products: ProtectionProduct[];
  structures: LongTermStructure[];
  onProductsChange: (products: ProtectionProduct[]) => void;
  onStructuresChange: (structures: LongTermStructure[]) => void;
}

const productTypes = [
  { value: 'life-cover-estate', label: 'Life Cover (Estate)' },
  { value: 'life-cover-beneficiary', label: 'Life Cover (Beneficiary)' },
  { value: 'life-cover-credit', label: 'Life Cover (Credit-Linked)' },
  { value: 'disability', label: 'Disability Cover' },
  { value: 'severe-illness', label: 'Severe Illness Cover' },
  { value: 'income-protection', label: 'Income Protection' },
  { value: 'career-ending-injury', label: 'Career-Ending Injury Cover' },
  { value: 'credit-life', label: 'Credit Life' },
];

const structureTypes = [
  { value: 'retirement-fund', label: 'Retirement Fund (Section 37C)' },
  { value: 'living-annuity', label: 'Living Annuity' },
  { value: 'trust-policy', label: 'Trust-Owned Policy' },
  { value: 'image-rights', label: 'Image Rights Structure' },
  { value: 'royalty-structure', label: 'Royalty Structure' },
];

const linkedOptions: { value: ProtectionProduct['linkedTo'][number]; label: string }[] = [
  { value: 'estate-obligations', label: 'Estate Obligations' },
  { value: 'dependant-income', label: 'Dependants\' Income' },
  { value: 'liquidity-shortfall', label: 'Liquidity Shortfall' },
];

const ProductsSection: React.FC<Props> = ({ products, structures, onProductsChange, onStructuresChange }) => {
  const addProduct = () => {
    onProductsChange([...products, { id: crypto.randomUUID(), type: 'life-cover-estate', description: '', coverAmount: 0, linkedTo: [] }]);
  };

  const addStructure = () => {
    onStructuresChange([...structures, { id: crypto.randomUUID(), type: 'retirement-fund', description: '', value: 0 }]);
  };

  const updateProduct = (id: string, field: string, value: any) => {
    onProductsChange(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleLinked = (id: string, linkVal: ProtectionProduct['linkedTo'][number]) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newLinked = product.linkedTo.includes(linkVal)
      ? product.linkedTo.filter(l => l !== linkVal)
      : [...product.linkedTo, linkVal];
    updateProduct(id, 'linkedTo', newLinked);
  };

  const updateStructure = (id: string, field: string, value: any) => {
    onStructuresChange(structures.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const totalCover = products.reduce((s, p) => s + p.coverAmount, 0);
  const totalStructures = structures.reduce((s, st) => s + st.value, 0);

  return (
    <div className="space-y-6">
      {/* Protection Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Risk & Protection Products
          </CardTitle>
          <Button size="sm" onClick={addProduct}><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="p-3 rounded-lg border border-border space-y-3">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={product.type} onValueChange={v => updateProduct(product.id, 'type', v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {productTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input className="h-9" value={product.description} onChange={e => updateProduct(product.id, 'description', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cover Amount (R)</Label>
                  <Input className="h-9" type="number" value={product.coverAmount || ''} onChange={e => updateProduct(product.id, 'coverAmount', Number(e.target.value))} />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onProductsChange(products.filter(p => p.id !== product.id))}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-xs text-muted-foreground">Linked to:</Label>
                {linkedOptions.map(opt => (
                  <div key={opt.value} className="flex items-center gap-1.5">
                    <Checkbox
                      checked={product.linkedTo.includes(opt.value)}
                      onCheckedChange={() => toggleLinked(product.id, opt.value)}
                      className="h-4 w-4"
                    />
                    <Label className="text-xs cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No protection products added.</p>}
          {totalCover > 0 && (
            <div className="text-right font-semibold text-foreground">Total Cover: {formatZAR(totalCover)}</div>
          )}
        </CardContent>
      </Card>

      {/* Long-Term Structures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" /> Long-Term Structures
          </CardTitle>
          <Button size="sm" onClick={addStructure}><Plus className="w-4 h-4 mr-1" /> Add Structure</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {structures.map(structure => (
            <div key={structure.id} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={structure.type} onValueChange={v => updateStructure(structure.id, 'type', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {structureTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input className="h-9" value={structure.description} onChange={e => updateStructure(structure.id, 'description', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value (R)</Label>
                <Input className="h-9" type="number" value={structure.value || ''} onChange={e => updateStructure(structure.id, 'value', Number(e.target.value))} />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onStructuresChange(structures.filter(s => s.id !== structure.id))}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          {structures.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No long-term structures added.</p>}
          {totalStructures > 0 && (
            <div className="text-right font-semibold text-foreground">Total Structures: {formatZAR(totalStructures)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsSection;
