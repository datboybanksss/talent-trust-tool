import { MediaBrand } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Globe, Camera, CheckCircle2 } from "lucide-react";

interface Props { data: MediaBrand }

const MediaBrandSection = ({ data }: Props) => (
  <div className="space-y-6">
    {/* Bio */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> Approved Bio
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
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
          <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">{a.type.replace("_", " ")}</Badge>
              <span className="text-sm text-foreground">{a.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{a.lastUpdated}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default MediaBrandSection;
