import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileInputs } from "@/utils/estateCalculations";

interface Props {
  data: ProfileInputs;
  onChange: (data: ProfileInputs) => void;
}

const ProfileSection: React.FC<Props> = ({ data, onChange }) => {
  const update = (key: keyof ProfileInputs, value: any) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Athlete / Entertainer Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Profession</Label>
            <Select value={data.profession} onValueChange={v => update('profession', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="athlete">Athlete</SelectItem>
                <SelectItem value="entertainer">Entertainer</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sport / Entertainment Field</Label>
            <Input value={data.field} onChange={e => update('field', e.target.value)} placeholder="e.g. Cricket, Music, Acting" />
          </div>

          <div className="space-y-2">
            <Label>Current Age</Label>
            <Input type="number" value={data.currentAge} onChange={e => update('currentAge', Number(e.target.value))} min={16} max={70} />
          </div>

          <div className="space-y-2">
            <Label>Expected Remaining Career (years)</Label>
            <Input type="number" value={data.remainingCareerYears} onChange={e => update('remainingCareerYears', Number(e.target.value))} min={1} max={30} />
          </div>

          <div className="space-y-2">
            <Label>Contract Type</Label>
            <Select value={data.contractType} onValueChange={v => update('contractType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed-term">Fixed-Term</SelectItem>
                <SelectItem value="sponsorship">Sponsorship-Based</SelectItem>
                <SelectItem value="royalties">Royalties</SelectItem>
                <SelectItem value="performance-linked">Performance-Linked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Injury / Career Interruption Risk</Label>
            <Select value={data.injuryRisk} onValueChange={v => update('injuryRisk', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marital Status</Label>
            <Select value={data.maritalStatus} onValueChange={v => update('maritalStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married-in-community">Married in Community of Property</SelectItem>
                <SelectItem value="married-out-community">Married out of Community (no accrual)</SelectItem>
                <SelectItem value="married-out-accrual">Married out of Community (with accrual)</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Dependants</Label>
            <Input type="number" value={data.numberOfDependants} onChange={e => update('numberOfDependants', Number(e.target.value))} min={0} max={20} />
          </div>

          <div className="space-y-2">
            <Label>Dependants' Dependency Window (years)</Label>
            <Input type="number" value={data.dependantsDependencyYears} onChange={e => update('dependantsDependencyYears', Number(e.target.value))} min={0} max={40} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
