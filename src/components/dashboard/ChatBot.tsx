import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  "life file": "Your **Life File** is a secure digital vault that stores all your critical personal and business documents — from IDs and contracts to beneficiary details and emergency contacts. Navigate to **Life File** in the sidebar to manage it.",
  "beneficiary": "You can manage your beneficiaries under **Life File → Beneficiaries**. Add, edit, or remove beneficiaries and set allocation percentages. All data is encrypted and only visible to you.",
  "document": "Upload and organize documents in the **Documents** section. Supported formats include PDF, images, and common office files. Each document can be tagged with an expiry date for automated reminders.",
  "compliance": "The **Compliance** section tracks regulatory requirements, deadlines, and filing statuses. You'll receive reminders before due dates to stay ahead of obligations.",
  "sharing": "You can securely share specific sections of your Life File with trusted contacts via **Sharing**. Set access levels (view-only or full access), expiry dates, and revoke access at any time.",
  "privacy": "Your privacy is our top priority. All data is encrypted at rest and in transit. We never sell or share your information with third parties. You control exactly who sees what through granular sharing permissions.",
  "security": "We use bank-grade encryption, row-level security policies, and multi-factor authentication to protect your data. Your information is isolated — no one, not even our team, can access it without your explicit permission.",
  "profile": "Your **Profile** page shows a comprehensive dashboard of your assets, compliance status, contract timelines, and Life File overview. You can also generate an **Executive Report** PDF from there.",
  "executive report": "The **Executive Report** is a downloadable PDF summarizing your entire profile — assets, compliance, contracts, and Life File status. Go to **My Profile** and click **Generate Executive Report**.",
  "advisor": "The **Advisors** section lets you manage your professional advisory team — accountants, lawyers, financial planners. Keep their details organized and accessible.",
  "reminder": "Set up **Reminders** for important dates — contract renewals, compliance deadlines, document expiries. We'll notify you via email before each due date.",
  "social media": "Track and secure your **Social Media** accounts in one place. Store recovery details, backup codes, and monitor account statuses.",
  "journey": "The **Journey Tracker** on your dashboard shows your progress through the business setup process. Each step is tracked so you always know what's next.",
  "emergency contact": "Add emergency contacts in your **Life File**. These are people who should be reached in critical situations. You can set priority levels for each contact.",
  "email": "The **Emails** section tracks all notification emails sent from the platform — reminders, sharing invites, and compliance alerts.",
  "dashboard": "Your **Dashboard** is your home base. It shows your company status, compliance overview, upcoming deadlines, and journey progress at a glance.",
  "help": "I can help you with:\n\n• **Navigating the platform** — ask about any section\n• **Privacy & security** — how we protect your data\n• **Life File management** — documents, beneficiaries, contacts\n• **Compliance & reminders** — staying on track\n• **Sharing & access control** — managing who sees what\n\nJust ask me anything!",
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  
  // Check for greetings
  if (/^(hi|hello|hey|good morning|good afternoon|howdy)/i.test(lower)) {
    return "Hello! 👋 I'm your platform assistant. I can help you navigate the platform, answer questions about features, and explain our privacy practices. What would you like to know?";
  }

  // Check for thanks
  if (/^(thank|thanks|cheers|appreciate)/i.test(lower)) {
    return "You're welcome! If you have any other questions, I'm here to help. 🛡️";
  }

  // Find best match from knowledge base
  let bestMatch = "";
  let bestScore = 0;

  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    const keywords = key.split(" ");
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  }

  if (bestScore > 0) return bestMatch;

  // Default response
  return "I'm not sure about that specific topic, but I can help you with navigating the platform, understanding privacy & security, managing your Life File, compliance tracking, and sharing controls. Could you rephrase your question, or type **help** to see what I can assist with?";
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm your secure platform assistant. I can help you navigate features, answer questions, and explain how we protect your privacy. What can I help you with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(trimmed);
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const quickActions = [
    "How is my data protected?",
    "What is the Life File?",
    "How do I share access?",
    "Help",
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
          isOpen && "rotate-0"
        )}
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Platform Assistant</p>
            <p className="text-xs text-muted-foreground">Private & Secure</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[340px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Quick actions on first message only */}
          {messages.length === 1 && !isTyping && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setInput(action);
                    setTimeout(() => {
                      const userMsg: Message = {
                        id: crypto.randomUUID(),
                        role: "user",
                        content: action,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, userMsg]);
                      setIsTyping(true);
                      setTimeout(() => {
                        const answer = findAnswer(action);
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            content: answer,
                            timestamp: new Date(),
                          },
                        ]);
                        setIsTyping(false);
                        setInput("");
                      }, 600 + Math.random() * 800);
                    }, 50);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary hover:border-primary/30 transition-all duration-200 text-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
              className="rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            🔒 Conversations are private and not stored
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
