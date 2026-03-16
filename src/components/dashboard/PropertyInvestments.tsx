import { MapPin, BedDouble, Bath, Square, TrendingUp, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  size: string;
  roi: string;
  status: "available" | "under-offer" | "new";
  image: string;
  featured?: boolean;
}

const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Sandton Executive Suite",
    location: "Sandton, Johannesburg",
    price: "R 4,250,000",
    type: "Apartment",
    beds: 3,
    baths: 2,
    size: "185 m²",
    roi: "8.2%",
    status: "new",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
    featured: true,
  },
  {
    id: "2",
    title: "Cape Town Waterfront Villa",
    location: "V&A Waterfront, Cape Town",
    price: "R 12,500,000",
    type: "Villa",
    beds: 5,
    baths: 4,
    size: "420 m²",
    roi: "6.5%",
    status: "available",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    title: "Umhlanga Ridge Office Park",
    location: "Umhlanga, Durban",
    price: "R 8,750,000",
    type: "Commercial",
    beds: 0,
    baths: 4,
    size: "650 m²",
    roi: "9.8%",
    status: "under-offer",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    title: "Stellenbosch Wine Estate Cottage",
    location: "Stellenbosch, Western Cape",
    price: "R 3,800,000",
    type: "Estate",
    beds: 4,
    baths: 3,
    size: "280 m²",
    roi: "7.1%",
    status: "available",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    title: "Pretoria East Family Home",
    location: "Waterkloof, Pretoria",
    price: "R 5,600,000",
    type: "House",
    beds: 4,
    baths: 3,
    size: "350 m²",
    roi: "7.4%",
    status: "new",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
  },
  {
    id: "6",
    title: "Rosebank Mixed-Use Development",
    location: "Rosebank, Johannesburg",
    price: "R 15,200,000",
    type: "Commercial",
    beds: 0,
    baths: 6,
    size: "900 m²",
    roi: "10.2%",
    status: "available",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=250&fit=crop",
    featured: true,
  },
];

const statusConfig = {
  available: { label: "Available", className: "bg-success/20 text-success border-success/30" },
  "under-offer": { label: "Under Offer", className: "bg-warning/20 text-warning border-warning/30" },
  new: { label: "New Listing", className: "bg-primary/20 text-primary border-primary/30" },
};

const PropertyInvestments = () => {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Listings</p>
          <p className="text-2xl font-display font-bold text-foreground">{sampleProperties.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Avg. ROI</p>
          <p className="text-2xl font-display font-bold text-success">8.2%</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Price Range</p>
          <p className="text-2xl font-display font-bold text-foreground">R3.8M – R15.2M</p>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sampleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

const PropertyCard = ({ property }: { property: Property }) => {
  const status = statusConfig[property.status];

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border shadow-soft overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md group",
      property.featured && "ring-2 ring-primary/30"
    )}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={cn("text-xs font-medium", status.className)}>
            {status.label}
          </Badge>
          {property.featured && (
            <Badge variant="outline" className="bg-gold/20 text-gold border-gold/30 text-xs font-medium">
              <Star className="w-3 h-3 mr-1" /> Featured
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <p className="text-sm font-bold text-foreground">{property.price}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground leading-tight">{property.title}</h3>
          <Badge variant="secondary" className="text-xs shrink-0">{property.type}</Badge>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>{property.location}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {property.beds > 0 && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              <span>{property.beds}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.baths}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{property.size}</span>
          </div>
        </div>

        {/* ROI & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-success">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{property.roi} ROI</span>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyInvestments;
