import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Phone, 
  Mail, 
  Star,
  ExternalLink,
  MessageCircle,
  Calendar,
  Briefcase,
  Scale,
  PiggyBank,
  Shield
} from "lucide-react";

const Advisors = () => {
  return (
    <DashboardLayout 
      title="My Advisors" 
      subtitle="Connect with our network of trusted professionals"
    >
      {/* Categories */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <CategoryCard
          icon={Scale}
          title="Legal"
          count={3}
          active
        />
        <CategoryCard
          icon={PiggyBank}
          title="Financial"
          count={4}
        />
        <CategoryCard
          icon={Briefcase}
          title="Business"
          count={2}
        />
        <CategoryCard
          icon={Shield}
          title="Insurance"
          count={2}
        />
      </div>

      {/* Advisors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advisors.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>

      {/* Request Advisor */}
      <div className="mt-8 bg-card rounded-2xl border border-border p-8 shadow-soft text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gold" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          Need a Specialist?
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Can't find the right advisor? Let us connect you with a specialist 
          tailored to your specific needs.
        </p>
        <Button variant="gold" size="lg">
          Request an Advisor
        </Button>
      </div>
    </DashboardLayout>
  );
};

interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  active?: boolean;
}

const CategoryCard = ({ icon: Icon, title, count, active }: CategoryCardProps) => (
  <button
    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
      active
        ? "border-gold bg-gold/10"
        : "border-border hover:border-gold/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          active ? "bg-gold text-forest-dark" : "bg-secondary text-muted-foreground"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={`font-medium ${active ? "text-gold" : "text-foreground"}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{count} advisors</p>
      </div>
    </div>
  </button>
);

interface Advisor {
  id: string;
  name: string;
  title: string;
  company: string;
  specialty: string;
  rating: number;
  reviews: number;
  image?: string;
  phone: string;
  email: string;
}

interface AdvisorCardProps {
  advisor: Advisor;
}

const AdvisorCard = ({ advisor }: AdvisorCardProps) => (
  <div className="bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0">
        {advisor.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{advisor.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{advisor.title}</p>
        <p className="text-sm text-gold truncate">{advisor.company}</p>
      </div>
    </div>

    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < advisor.rating ? "text-gold fill-gold" : "text-muted"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({advisor.reviews} reviews)</span>
    </div>

    <div className="p-3 bg-secondary/50 rounded-lg mb-4">
      <p className="text-xs text-muted-foreground mb-1">Specialty</p>
      <p className="text-sm font-medium text-foreground">{advisor.specialty}</p>
    </div>

    <div className="space-y-2 mb-4">
      <a
        href={`tel:${advisor.phone}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Phone className="w-4 h-4" />
        {advisor.phone}
      </a>
      <a
        href={`mailto:${advisor.email}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Mail className="w-4 h-4" />
        {advisor.email}
      </a>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1">
        <Calendar className="w-4 h-4" />
        Schedule
      </Button>
      <Button variant="gold" size="sm" className="flex-1">
        <MessageCircle className="w-4 h-4" />
        Contact
      </Button>
    </div>
  </div>
);

const advisors: Advisor[] = [
  {
    id: "1",
    name: "Sarah van der Merwe",
    title: "Corporate Attorney",
    company: "Van der Merwe Legal",
    specialty: "Company Law, Trust Formation, Sports Contracts",
    rating: 5,
    reviews: 28,
    phone: "+27 11 123 4567",
    email: "sarah@vdmlegal.co.za",
  },
  {
    id: "2",
    name: "David Nkosi",
    title: "Chartered Accountant",
    company: "Nkosi & Associates",
    specialty: "Tax Planning, Financial Statements, SARS Compliance",
    rating: 5,
    reviews: 45,
    phone: "+27 11 234 5678",
    email: "david@nkosiassociates.co.za",
  },
  {
    id: "3",
    name: "Lisa Thompson",
    title: "Wealth Manager",
    company: "Legacy Wealth Management",
    specialty: "Investment Strategy, Estate Planning, Athlete Finances",
    rating: 4,
    reviews: 32,
    phone: "+27 11 345 6789",
    email: "lisa@legacywealth.co.za",
  },
  {
    id: "4",
    name: "Michael Botha",
    title: "Business Consultant",
    company: "Botha Business Advisory",
    specialty: "Business Strategy, Brand Development, Sponsorship Deals",
    rating: 5,
    reviews: 19,
    phone: "+27 11 456 7890",
    email: "michael@bothabusiness.co.za",
  },
  {
    id: "5",
    name: "Priya Naidoo",
    title: "IP Attorney",
    company: "Naidoo IP Law",
    specialty: "Intellectual Property, Trademark Registration, Artist Rights",
    rating: 5,
    reviews: 24,
    phone: "+27 11 567 8901",
    email: "priya@naidooip.co.za",
  },
  {
    id: "6",
    name: "James Molefe",
    title: "Insurance Broker",
    company: "Shield Insurance",
    specialty: "Personal Liability, Career Insurance, Asset Protection",
    rating: 4,
    reviews: 38,
    phone: "+27 11 678 9012",
    email: "james@shieldinsurance.co.za",
  },
];

export default Advisors;
