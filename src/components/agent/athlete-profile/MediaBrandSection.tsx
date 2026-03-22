import { MediaBrand } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Globe, Camera, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditableField from "./EditableField";

interface Props {
  data: MediaBrand;
  editMode?: boolean;
  onChange?: (data: MediaBrand) => void;
}

const MediaBrandSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof MediaBrand, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Approved Bio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <EditableField label="Approved Bio" value={data.approvedBio} editMode={true} onChange={(v) => update("approvedBio", v)} type="textarea" />
              <EditableField label="Short Bio" value={data.shortBio || ""} editMode={true} onChange={(v) => update("shortBio", v)} type="textarea" />
              <EditableField label="Brand Guidelines" value={data.brandGuidelines || ""} editMode={true} onChange={(v) => update("brandGuidelines", v)} />
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed">{data.approvedBio}</p>
              {data.shortBio && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Short Bio</p>
                  <p className="text-sm text-foreground italic">{data.shortBio}</p>
                </div>
              )}
              {data.brandGuidelines && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Brand Guidelines</p>
                  <p className="text-sm text-foreground">{data.brandGuidelines}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Social Media
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.socialMedia.map((s, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-xl">
              {editMode ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <Input value={s.platform} onChange={(e) => { const u = [...data.socialMedia]; u[i] = { ...s, platform: e.target.value }; update("socialMedia", u); }} placeholder="Platform" className="text-sm h-8" />
                  <Input value={s.handle} onChange={(e) => { const u = [...data.socialMedia]; u[i] = { ...s, handle: e.target.value }; update("socialMedia", u); }} placeholder="Handle" className="text-sm h-8" />
                  <Input value={s.followers} onChange={(e) => { const u = [...data.socialMedia]; u[i] = { ...s, followers: e.target.value }; update("socialMedia", u); }} placeholder="Followers" className="text-sm h-8" />
                  <Input value={s.url} onChange={(e) => { const u = [...data.socialMedia]; u[i] = { ...s, url: e.target.value }; update("socialMedia", u); }} placeholder="URL" className="text-sm h-8" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.platform}</p>
                      <p className="text-xs text-muted-foreground">{s.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.followers}</span>
                    {s.verified && <CheckCircle2 className="w-4 h-4 text-info" />}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Press Assets */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" /> Press Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.pressAssets.map((a, i) => (
            <div key={i} className="p-2 bg-muted/50 rounded-lg">
              {editMode ? (
                <div className="grid grid-cols-3 gap-2">
                  <Input value={a.title} onChange={(e) => { const u = [...data.pressAssets]; u[i] = { ...a, title: e.target.value }; update("pressAssets", u); }} placeholder="Title" className="text-sm h-8" />
                  <Input value={a.type} onChange={(e) => { const u = [...data.pressAssets]; u[i] = { ...a, type: e.target.value as any }; update("pressAssets", u); }} placeholder="Type" className="text-sm h-8" />
                  <Input value={a.lastUpdated} onChange={(e) => { const u = [...data.pressAssets]; u[i] = { ...a, lastUpdated: e.target.value }; update("pressAssets", u); }} placeholder="Last updated" className="text-sm h-8" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{a.type.replace("_", " ")}</Badge>
                    <span className="text-sm text-foreground">{a.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.lastUpdated}</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaBrandSection;
