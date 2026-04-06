import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MessageSquare, Calendar, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryType: searchParams.get("type") || "",
    message: searchParams.get("message") || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.enquiryType || !formData.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setFormData({ name: "", email: "", phone: "", enquiryType: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-gold">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">LegacyBuilder</span>
          </div>
        </div>
      </div>

      <div className="container py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Let's Talk About Your <span className="text-gold">Legacy</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're an athlete, artist, or agent — our team is ready to walk you through how LegacyBuilder protects what matters most.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: "Email Us", value: "hello@legacybuilder.co.za", href: "mailto:hello@legacybuilder.co.za" },
                  { icon: Phone, label: "Call Us", value: "+27 (0) 11 000 0000", href: "tel:+27110000000" },
                  { icon: MessageSquare, label: "WhatsApp", value: "+27 (0) 60 000 0000", href: "https://wa.me/27600000000" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-foreground font-medium group-hover:text-gold transition-colors">{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <Card className="border-gold/20 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gold" />
                  <h3 className="font-display font-bold text-foreground">Book a Demo</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Prefer a live walkthrough? Select "Book a Demo" in the form and we'll schedule a 30-minute personalised session.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ No obligation, completely free</p>
                  <p>✓ See the platform with your own data</p>
                  <p>✓ Get answers from a specialist</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="border-border bg-card">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value.slice(0, 100) }))}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value.slice(0, 255) }))}
                        maxLength={255}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        placeholder="+27 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.slice(0, 20) }))}
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Enquiry Type *</Label>
                      <Select value={formData.enquiryType} onValueChange={(v) => setFormData((p) => ({ ...p, enquiryType: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Book a Demo</SelectItem>
                          <SelectItem value="pricing">Pricing Question</SelectItem>
                          <SelectItem value="financial_planning">Financial Planning / CFP® Consultation</SelectItem>
                          <SelectItem value="athlete">Athlete Enquiry</SelectItem>
                          <SelectItem value="artist">Artist Enquiry</SelectItem>
                          <SelectItem value="agent">Agent / Manager Enquiry</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value.slice(0, 1000) }))}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground text-right">{formData.message.length}/1000</p>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
