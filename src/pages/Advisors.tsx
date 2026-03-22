import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Phone, 
  Mail, 
  Star,
  MessageCircle,
  Calendar,
  Briefcase,
  Scale,
  PiggyBank,
  Shield,
  Globe,
  Smartphone
} from "lucide-react";

type Category = "Legal" | "Financial" | "Business" | "Insurance";

const Advisors = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("Legal");

  const filtered = advisors.filter((a) => a.category === activeCategory);

  return (
    <DashboardLayout 
      title="My Advisors" 
      subtitle="Connect with our network of trusted professionals"
    >
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            icon={cat.icon}
            title={cat.title}
            count={advisors.filter((a) => a.category === cat.title).length}
            active={activeCategory === cat.title}
            onClick={() => setActiveCategory(cat.title)}
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} />
        ))}
      </div>

      <div className="mt-8 bg-card rounded-2xl border border-border p-8 shadow-soft text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gold" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">Need a Specialist?</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Can't find the right advisor? Let us connect you with a specialist tailored to your specific needs.
        </p>
        <Button variant="gold" size="lg">Request an Advisor</Button>
      </div>
    </DashboardLayout>
  );
};

const categories: { icon: React.ElementType; title: Category }[] = [
  { icon: Scale, title: "Legal" },
  { icon: PiggyBank, title: "Financial" },
  { icon: Briefcase, title: "Business" },
  { icon: Shield, title: "Insurance" },
];

interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}

const CategoryCard = ({ icon: Icon, title, count, active, onClick }: CategoryCardProps) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
      active ? "border-gold bg-gold/10" : "border-border hover:border-gold/50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        active ? "bg-gold text-forest-dark" : "bg-secondary text-muted-foreground"
      }`}>
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
  category: Category;
  phone: string;
  cell: string;
  
  email: string;
  website: string;
}

const AdvisorCard = ({ advisor }: { advisor: Advisor }) => (
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
          <Star key={i} className={`w-4 h-4 ${i < advisor.rating ? "text-gold fill-gold" : "text-muted"}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({advisor.reviews} reviews)</span>
    </div>

    <div className="p-3 bg-secondary/50 rounded-lg mb-4">
      <p className="text-xs text-muted-foreground mb-1">Specialty</p>
      <p className="text-sm font-medium text-foreground">{advisor.specialty}</p>
    </div>

    <div className="space-y-2 mb-4">
      <a href={`tel:${advisor.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Phone className="w-4 h-4" /> {advisor.phone}
      </a>
      <a href={`tel:${advisor.cell}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Smartphone className="w-4 h-4" /> {advisor.cell}
      </a>
      <a href={`mailto:${advisor.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Mail className="w-4 h-4" /> {advisor.email}
      </a>
      <a href={advisor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Globe className="w-4 h-4" /> {advisor.website.replace(/^https?:\/\//, "")}
      </a>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1">
        <Calendar className="w-4 h-4" /> Schedule
      </Button>
      <Button variant="gold" size="sm" className="flex-1">
        <MessageCircle className="w-4 h-4" /> Contact
      </Button>
    </div>
  </div>
);

const advisors: Advisor[] = [
  {
    id: "1", name: "Sarah van der Merwe", title: "Corporate Attorney", company: "Van der Merwe Legal",
    specialty: "Company Law, Trust Formation, Sports Contracts", rating: 5, reviews: 28, category: "Legal",
    phone: "+27 11 123 4567", cell: "+27 82 123 4567",
    email: "sarah@vdmlegal.co.za", website: "https://vdmlegal.co.za",
  },
  {
    id: "2", name: "David Nkosi", title: "Chartered Accountant", company: "Nkosi & Associates",
    specialty: "Tax Planning, Financial Statements, SARS Compliance", rating: 5, reviews: 45, category: "Financial",
    phone: "+27 11 234 5678", cell: "+27 83 234 5678",
    email: "david@nkosiassociates.co.za", website: "https://nkosiassociates.co.za",
  },
  {
    id: "3", name: "Lisa Thompson", title: "Wealth Manager", company: "Legacy Wealth Management",
    specialty: "Investment Strategy, Estate Planning, Athlete Finances", rating: 4, reviews: 32, category: "Financial",
    phone: "+27 11 345 6789", cell: "+27 84 345 6789",
    email: "lisa@legacywealth.co.za", website: "https://legacywealth.co.za",
  },
  {
    id: "4", name: "Michael Botha", title: "Business Consultant", company: "Botha Business Advisory",
    specialty: "Business Strategy, Brand Development, Sponsorship Deals", rating: 5, reviews: 19, category: "Business",
    phone: "+27 11 456 7890", cell: "+27 85 456 7890",
    email: "michael@bothabusiness.co.za", website: "https://bothabusiness.co.za",
  },
  {
    id: "5", name: "Priya Naidoo", title: "IP Attorney", company: "Naidoo IP Law",
    specialty: "Intellectual Property, Trademark Registration, Artist Rights", rating: 5, reviews: 24, category: "Legal",
    phone: "+27 11 567 8901", cell: "+27 86 567 8901",
    email: "priya@naidooip.co.za", website: "https://naidooip.co.za",
  },
  {
    id: "6", name: "James Molefe", title: "Insurance Broker", company: "Shield Insurance",
    specialty: "Personal Liability, Career Insurance, Asset Protection", rating: 4, reviews: 38, category: "Insurance",
    phone: "+27 11 678 9012", cell: "+27 87 678 9012",
    email: "james@shieldinsurance.co.za", website: "https://shieldinsurance.co.za",
  },
  {
    id: "7", name: "Thandeka Zulu", title: "Financial Planner", company: "Zulu Financial Planning",
    specialty: "Retirement Planning, Risk Management, Tax Optimization", rating: 5, reviews: 31, category: "Financial",
    phone: "+27 11 789 0123", cell: "+27 72 789 0123",
    email: "thandeka@zulufinancial.co.za", website: "https://zulufinancial.co.za",
  },
  {
    id: "8", name: "Andre du Plessis", title: "Business Strategist", company: "Du Plessis Consulting",
    specialty: "Franchise Development, Market Entry, Growth Strategy", rating: 4, reviews: 22, category: "Business",
    phone: "+27 11 890 1234", cell: "+27 73 890 1234",
    email: "andre@dpconsulting.co.za", website: "https://dpconsulting.co.za",
  },
  {
    id: "9", name: "Nomsa Khumalo", title: "Life Insurance Specialist", company: "Guardian Life SA",
    specialty: "Life Cover, Disability Insurance, Income Protection", rating: 5, reviews: 41, category: "Insurance",
    phone: "+27 11 901 2345", cell: "+27 74 901 2345",
    email: "nomsa@guardianlife.co.za", website: "https://guardianlife.co.za",
  },
];

export default Advisors;
