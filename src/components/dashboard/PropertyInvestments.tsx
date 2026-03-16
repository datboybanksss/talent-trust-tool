import { useState } from "react";
import { MapPin, BedDouble, Bath, Square, TrendingUp, Star, ExternalLink, Calendar, Shield, Ruler, Car, Trees, Wifi, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

const propertyDetails: Record<string, { description: string; features: string[]; agent: { name: string; phone: string; email: string }; yearBuilt: string; levies: string; rates: string; parking: string; erfSize: string }> = {
  "1": { description: "A stunning executive apartment in the heart of Sandton's financial district, offering panoramic city views and premium finishes throughout. Walking distance to Sandton City and the Gautrain.", features: ["24/7 Security", "Fibre Internet", "Gym & Pool", "Concierge", "Underground Parking", "Balcony"], agent: { name: "Sarah van der Merwe", phone: "+27 82 555 0101", email: "sarah@luxprops.co.za" }, yearBuilt: "2022", levies: "R 4,800/mo", rates: "R 2,100/mo", parking: "2 Bays", erfSize: "N/A" },
  "2": { description: "An exquisite waterfront villa with direct ocean views, infinity pool, and private garden. Located in Cape Town's most prestigious address with world-class restaurants and shopping at your doorstep.", features: ["Ocean Views", "Infinity Pool", "Private Garden", "Smart Home", "Wine Cellar", "Staff Quarters"], agent: { name: "James Mthembu", phone: "+27 83 555 0202", email: "james@capeprops.co.za" }, yearBuilt: "2019", levies: "R 8,500/mo", rates: "R 5,200/mo", parking: "4 Bays", erfSize: "1,200 m²" },
  "3": { description: "A premium office park in Umhlanga Ridge with high foot traffic, modern infrastructure, and excellent visibility. Ideal for corporate tenants seeking a prestigious KZN address.", features: ["A-Grade Offices", "Fibre Ready", "Generator Backup", "Boardroom Facilities", "Kitchenette", "Visitor Parking"], agent: { name: "Priya Naidoo", phone: "+27 84 555 0303", email: "priya@kzncommercial.co.za" }, yearBuilt: "2020", levies: "R 12,000/mo", rates: "R 6,800/mo", parking: "15 Bays", erfSize: "2,400 m²" },
  "4": { description: "A charming cottage on a working wine estate in the heart of Stellenbosch. Surrounded by vineyards and mountains, this property offers a unique lifestyle investment with strong Airbnb potential.", features: ["Mountain Views", "Vineyard Access", "Borehole Water", "Solar Panels", "Fireplace", "Outdoor Entertainment"], agent: { name: "Hendrik du Plessis", phone: "+27 82 555 0404", email: "hendrik@winelandsprops.co.za" }, yearBuilt: "2015", levies: "R 3,200/mo", rates: "R 1,800/mo", parking: "2 Bays", erfSize: "3,500 m²" },
  "5": { description: "A spacious family home in the leafy suburb of Waterkloof, Pretoria. Features open-plan living, a large garden, and a swimming pool. Close to top schools and diplomatic quarter.", features: ["Swimming Pool", "Large Garden", "Alarm System", "Electric Fencing", "Double Garage", "Staff Quarters"], agent: { name: "Lerato Molefe", phone: "+27 83 555 0505", email: "lerato@ptaprops.co.za" }, yearBuilt: "2017", levies: "N/A", rates: "R 3,400/mo", parking: "2 Garage", erfSize: "1,800 m²" },
  "6": { description: "A landmark mixed-use development in Rosebank offering premium retail and office space. AAA-grade finishes with direct access to the Gautrain station and Rosebank Mall.", features: ["Gautrain Access", "Retail + Office", "Green Building", "Backup Power", "CCTV Security", "Rooftop Terrace"], agent: { name: "Michael Okonkwo", phone: "+27 84 555 0606", email: "michael@jhbcommercial.co.za" }, yearBuilt: "2023", levies: "R 18,000/mo", rates: "R 9,500/mo", parking: "25 Bays", erfSize: "4,200 m²" },
};

const PropertyCard = ({ property }: { property: Property }) => {
  const [open, setOpen] = useState(false);
  const status = statusConfig[property.status];
  const details = propertyDetails[property.id];

  return (
    <>
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

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{property.roi} ROI</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">{property.title}</DialogTitle>
          </DialogHeader>

          {/* Hero image */}
          <div className="relative h-56 rounded-xl overflow-hidden">
            <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="outline" className={cn("text-xs font-medium", status.className)}>
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Price & Location */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{property.price}</p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg font-bold">{property.roi} ROI</span>
              </div>
              <Badge variant="secondary" className="mt-1">{property.type}</Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {details && (
            <>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{details.description}</p>
              </div>

              <Separator />

              {/* Key specs grid */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Property Details</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.beds > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                      <BedDouble className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                        <p className="text-sm font-medium text-foreground">{property.beds}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                      <p className="text-sm font-medium text-foreground">{property.baths}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Square className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Floor Area</p>
                      <p className="text-sm font-medium text-foreground">{property.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Year Built</p>
                      <p className="text-sm font-medium text-foreground">{details.yearBuilt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Parking</p>
                      <p className="text-sm font-medium text-foreground">{details.parking}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Erf Size</p>
                      <p className="text-sm font-medium text-foreground">{details.erfSize}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Monthly costs */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Monthly Costs</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Levies</p>
                    <p className="text-sm font-semibold text-foreground">{details.levies}</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Rates & Taxes</p>
                    <p className="text-sm font-semibold text-foreground">{details.rates}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {details.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Agent contact */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Agent Contact</h4>
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <p className="font-medium text-foreground mb-2">{details.agent.name}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{details.agent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{details.agent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">Request Viewing</Button>
                <Button variant="outline" className="flex-1">Download Brochure</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyInvestments;
