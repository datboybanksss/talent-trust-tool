import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-forest-dark text-primary-foreground py-16">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-forest-dark" />
              </div>
              <span className="text-xl font-display font-bold">LegacyBuilder</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering South Africa's athletes, artists, and entrepreneurs to 
              build lasting business legacies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Company Registration</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Trust Formation</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Compliance Management</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Document Vault</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Client Types</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Athletes</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Artists</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Entrepreneurs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Johannesburg, South Africa</li>
              <li>info@legacybuilder.co.za</li>
              <li>+27 11 000 0000</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} LegacyBuilder. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <Link to="/" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
