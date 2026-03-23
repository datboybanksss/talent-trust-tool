import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";

interface ExecutiveFiltersProps {
  dateRange: string;
  setDateRange: (v: string) => void;
  clientType: string;
  setClientType: (v: string) => void;
  businessUnit: string;
  setBusinessUnit: (v: string) => void;
}

const ExecutiveFilters = ({
  dateRange, setDateRange,
  clientType, setClientType,
  businessUnit, setBusinessUnit,
}: ExecutiveFiltersProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <Filter className="w-4 h-4 text-muted-foreground" />

    <Select value={dateRange} onValueChange={setDateRange}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ytd">Year to Date</SelectItem>
        <SelectItem value="q1">Q1</SelectItem>
        <SelectItem value="q2">Q2</SelectItem>
        <SelectItem value="q3">Q3</SelectItem>
        <SelectItem value="q4">Q4</SelectItem>
        <SelectItem value="last12">Last 12 Months</SelectItem>
      </SelectContent>
    </Select>

    <Select value={clientType} onValueChange={setClientType}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Clients</SelectItem>
        <SelectItem value="athletes">Athletes</SelectItem>
        <SelectItem value="artists">Artists</SelectItem>
        <SelectItem value="brands">Brands</SelectItem>
        <SelectItem value="trusts">Trusts</SelectItem>
      </SelectContent>
    </Select>

    <Select value={businessUnit} onValueChange={setBusinessUnit}>
      <SelectTrigger className="w-[150px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Units</SelectItem>
        <SelectItem value="sports">Sports Management</SelectItem>
        <SelectItem value="entertainment">Entertainment</SelectItem>
        <SelectItem value="brand">Brand Partnerships</SelectItem>
      </SelectContent>
    </Select>

    <Button variant="outline" size="sm" className="h-8 text-xs ml-auto gap-1.5">
      <Download className="w-3.5 h-3.5" />
      Export PDF
    </Button>
  </div>
);

export default ExecutiveFilters;
