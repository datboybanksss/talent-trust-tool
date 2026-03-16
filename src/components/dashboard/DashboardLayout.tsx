import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import ChatBot from "./ChatBot";
import { Bell, Search } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-secondary rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                />
              </div>
              
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
              </button>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;
