import { useState } from "react";
import { Store, MapPin, TrendingUp, Star, DollarSign, Users, Clock, Phone, Mail, ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Franchise {
  id: string;
  brand: string;
  industry: string;
  investmentRange: string;
  monthlyRevenue: string;
  roi: string;
  locations: number;
  established: string;
  status: "available" | "limited" | "popular";
  image: string;
  featured?: boolean;
}

const sampleFranchises: Franchise[] = [
  {
    id: "1",
    brand: "Nando's",
    industry: "Quick Service Restaurant",
    investmentRange: "R 5,000,000 – R 8,000,000",
    monthlyRevenue: "R 800,000+",
    roi: "18–25%",
    locations: 350,
    established: "1987",
    status: "limited",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
    featured: true,
  },
  {
    id: "2",
    brand: "Steers",
    industry: "Fast Food Restaurant",
    investmentRange: "R 3,500,000 – R 5,500,000",
    monthlyRevenue: "R 600,000+",
    roi: "15–22%",
    locations: 600,
    established: "1960",
    status: "available",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    brand: "Spur Steak Ranches",
    industry: "Family Restaurant",
    investmentRange: "R 4,000,000 – R 7,000,000",
    monthlyRevenue: "R 750,000+",
    roi: "14–20%",
    locations: 320,
    established: "1967",
    status: "popular",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
    featured: true,
  },
  {
    id: "4",
    brand: "Vida e Caffè",
    industry: "Coffee & Café",
    investmentRange: "R 1,500,000 – R 2,500,000",
    monthlyRevenue: "R 350,000+",
    roi: "20–28%",
    locations: 80,
    established: "2001",
    status: "available",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    brand: "Pick n Pay",
    industry: "Retail / Grocery",
    investmentRange: "R 8,000,000 – R 15,000,000",
    monthlyRevenue: "R 2,500,000+",
    roi: "12–18%",
    locations: 1900,
    established: "1967",
    status: "limited",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=250&fit=crop",
  },
  {
    id: "6",
    brand: "Mugg & Bean",
    industry: "Coffee & Restaurant",
    investmentRange: "R 3,000,000 – R 5,000,000",
    monthlyRevenue: "R 500,000+",
    roi: "16–22%",
    locations: 150,
    established: "1996",
    status: "popular",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop",
  },
  {
    id: "7",
    brand: "Ocean Basket",
    industry: "Seafood Restaurant",
    investmentRange: "R 3,500,000 – R 6,000,000",
    monthlyRevenue: "R 550,000+",
    roi: "14–19%",
    locations: 200,
    established: "1995",
    status: "available",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=250&fit=crop",
  },
  {
    id: "8",
    brand: "Wimpy",
    industry: "Fast Food Restaurant",
    investmentRange: "R 2,500,000 – R 4,500,000",
    monthlyRevenue: "R 450,000+",
    roi: "15–21%",
    locations: 480,
    established: "1967",
    status: "available",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=250&fit=crop",
  },
];

const franchiseDetails: Record<string, {
  description: string;
  franchiseFee: string;
  royaltyFee: string;
  marketingFee: string;
  contractLength: string;
  training: string;
  support: string;
  requirements: string[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}> = {
  "1": {
    description: "Nando's is a globally recognized South African flame-grilled PERi-PERi chicken brand. Known for its distinctive dining experience and bold flavours, Nando's offers a proven franchise model with strong brand loyalty.",
    franchiseFee: "R 350,000",
    royaltyFee: "5% of turnover",
    marketingFee: "2% of turnover",
    contractLength: "10 years",
    training: "6 weeks intensive",
    support: "Ongoing operational & marketing support",
    requirements: ["Net worth R 10M+", "Hands-on operator", "Passion for hospitality", "Proven business track record"],
    contactPerson: "Franchise Development Team",
    contactPhone: "+27 11 241 2600",
    contactEmail: "franchising@nandos.co.za",
  },
  "2": {
    description: "Steers is South Africa's leading flame-grilled burger brand and part of the Famous Brands stable. With over 60 years of heritage, Steers offers a robust franchise with high foot traffic and strong consumer demand.",
    franchiseFee: "R 250,000",
    royaltyFee: "5% of turnover",
    marketingFee: "3% of turnover",
    contractLength: "10 years",
    training: "4 weeks intensive",
    support: "Full operational, supply chain & marketing support",
    requirements: ["Net worth R 5M+", "Restaurant experience preferred", "Strong work ethic"],
    contactPerson: "Famous Brands Franchising",
    contactPhone: "+27 11 315 2200",
    contactEmail: "franchising@famousbrands.co.za",
  },
  "3": {
    description: "Spur Steak Ranches is an iconic South African family restaurant chain known for its welcoming atmosphere, generous portions and kids' entertainment areas. A strong brand with multi-generational appeal.",
    franchiseFee: "R 300,000",
    royaltyFee: "5% of turnover",
    marketingFee: "2.5% of turnover",
    contractLength: "10 years",
    training: "5 weeks at Spur Academy",
    support: "Comprehensive training, site selection & operational support",
    requirements: ["Net worth R 8M+", "Hospitality experience", "Community-oriented mindset"],
    contactPerson: "Spur Corporation Franchising",
    contactPhone: "+27 21 555 5100",
    contactEmail: "franchise@spurcorp.com",
  },
  "4": {
    description: "Vida e Caffè is a premium Portuguese-inspired coffee brand offering artisanal coffee and café culture. Popular in high-traffic retail and commercial locations across South Africa.",
    franchiseFee: "R 150,000",
    royaltyFee: "6% of turnover",
    marketingFee: "2% of turnover",
    contractLength: "7 years",
    training: "3 weeks barista & operations",
    support: "Ongoing quality control & brand support",
    requirements: ["Net worth R 3M+", "Passion for coffee culture", "Retail location preferred"],
    contactPerson: "Vida Franchising",
    contactPhone: "+27 21 424 1026",
    contactEmail: "franchising@vidaecaffe.com",
  },
  "5": {
    description: "Pick n Pay is one of Africa's largest and most trusted retail grocery chains. Their franchise model allows entrepreneurs to operate under a proven brand with centralised supply chain and marketing.",
    franchiseFee: "R 500,000",
    royaltyFee: "Variable",
    marketingFee: "Included in royalty",
    contractLength: "15 years",
    training: "8 weeks comprehensive retail training",
    support: "Full supply chain, IT, HR & marketing support",
    requirements: ["Net worth R 20M+", "Retail management experience", "Strong financial backing"],
    contactPerson: "Pick n Pay Franchise Division",
    contactPhone: "+27 21 658 1000",
    contactEmail: "franchise@pnp.co.za",
  },
  "6": {
    description: "Mugg & Bean is a beloved South African coffee shop and restaurant offering generous meals and quality coffee. Part of the Famous Brands group with excellent brand recognition.",
    franchiseFee: "R 250,000",
    royaltyFee: "5% of turnover",
    marketingFee: "3% of turnover",
    contractLength: "10 years",
    training: "5 weeks intensive",
    support: "Operational, marketing & supply chain support",
    requirements: ["Net worth R 6M+", "Hospitality experience preferred", "Hands-on operator"],
    contactPerson: "Famous Brands Franchising",
    contactPhone: "+27 11 315 2200",
    contactEmail: "franchising@famousbrands.co.za",
  },
  "7": {
    description: "Ocean Basket is South Africa's favourite seafood restaurant, offering fresh fish and Mediterranean-inspired dishes. A well-established brand with international expansion.",
    franchiseFee: "R 200,000",
    royaltyFee: "5% of turnover",
    marketingFee: "2% of turnover",
    contractLength: "10 years",
    training: "4 weeks training programme",
    support: "Full operational & franchise support",
    requirements: ["Net worth R 5M+", "Restaurant industry experience", "Customer service focus"],
    contactPerson: "Ocean Basket Franchising",
    contactPhone: "+27 11 706 4310",
    contactEmail: "franchise@oceanbasket.com",
  },
  "8": {
    description: "Wimpy is a long-standing South African fast food brand known for its breakfast and burger menu. Part of the Famous Brands stable with consistent foot traffic and loyal customer base.",
    franchiseFee: "R 200,000",
    royaltyFee: "5% of turnover",
    marketingFee: "3% of turnover",
    contractLength: "10 years",
    training: "4 weeks training",
    support: "Full operational & marketing support",
    requirements: ["Net worth R 4M+", "Passion for food service", "Business management skills"],
    contactPerson: "Famous Brands Franchising",
    contactPhone: "+27 11 315 2200",
    contactEmail: "franchising@famousbrands.co.za",
  },
};

const FranchiseInvestments = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">
            Explore established South African franchise brands with proven business models and strong returns.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {sampleFranchises.length} Opportunities
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sampleFranchises.map((franchise) => (
          <FranchiseCard key={franchise.id} franchise={franchise} />
        ))}
      </div>
    </div>
  );
};

const FranchiseCard = ({ franchise }: { franchise: Franchise }) => {
  const [showDetails, setShowDetails] = useState(false);
  const details = franchiseDetails[franchise.id];

  return (
    <>
      <div
        className={cn(
          "bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-md transition-all duration-300 group",
          franchise.featured && "ring-2 ring-primary/30"
        )}
      >
        <div className="relative">
          <img
            src={franchise.image}
            alt={franchise.brand}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              className={cn(
                "text-xs",
                franchise.status === "limited"
                  ? "bg-destructive/90 text-destructive-foreground"
                  : franchise.status === "popular"
                  ? "bg-primary/90 text-primary-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {franchise.status === "limited" ? "Limited Availability" : franchise.status === "popular" ? "Popular" : "Available"}
            </Badge>
          </div>
          {franchise.featured && (
            <div className="absolute top-3 right-3">
              <Star className="w-5 h-5 text-primary fill-primary" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-bold text-foreground text-lg leading-tight">
              {franchise.brand}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              <Store className="w-3 h-3 inline mr-1" />
              {franchise.industry}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Investment</span>
            <span className="font-semibold text-foreground">{franchise.investmentRange.split("–")[0]}+</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              ROI {franchise.roi}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {franchise.locations}+ outlets
            </span>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
            <Button size="sm" className="flex-1 text-xs">
              Enquire
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {details && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">{franchise.brand}</DialogTitle>
              <p className="text-muted-foreground text-sm">{franchise.industry} · Est. {franchise.established}</p>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <img
                src={franchise.image}
                alt={franchise.brand}
                className="w-full h-52 object-cover rounded-xl"
              />

              <p className="text-sm text-muted-foreground leading-relaxed">
                {details.description}
              </p>

              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Financial Overview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Investment", value: franchise.investmentRange },
                    { label: "Franchise Fee", value: details.franchiseFee },
                    { label: "Royalty Fee", value: details.royaltyFee },
                    { label: "Marketing Fee", value: details.marketingFee },
                    { label: "Est. Monthly Revenue", value: franchise.monthlyRevenue },
                    { label: "Projected ROI", value: franchise.roi },
                  ].map((item) => (
                    <div key={item.label} className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-foreground text-sm">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Franchise Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Contract Length</p>
                    <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {details.contractLength}
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Training</p>
                    <p className="font-semibold text-foreground text-sm">{details.training}</p>
                  </div>
                  <div className="col-span-2 bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Ongoing Support</p>
                    <p className="font-semibold text-foreground text-sm">{details.support}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Requirements
                </h4>
                <ul className="space-y-2">
                  {details.requirements.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-foreground mb-3">Contact</h4>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-foreground text-sm">{details.contactPerson}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> {details.contactPhone}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> {details.contactEmail}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">Request Information Pack</Button>
                <Button variant="outline" className="flex-1">Schedule a Call</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FranchiseInvestments;
