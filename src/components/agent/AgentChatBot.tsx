import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type Gender = "female" | "male" | null;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat-assistant`;

async function streamChat({
  messages,
  assistantName,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  assistantName: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, assistantName }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(err.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const AgentChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [gender, setGender] = useState<Gender>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const assistantName = gender === "female" ? "Thandi" : gender === "male" ? "Daniel" : "";

  // Load saved gender preference
  useEffect(() => {
    const saved = localStorage.getItem("agent-assistant-gender") as Gender;
    if (saved) {
      setGender(saved);
    }
  }, []);

  // Set welcome message when gender is chosen
  useEffect(() => {
    if (gender && messages.length === 0) {
      const name = gender === "female" ? "Thandi" : "Daniel";
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi there! 👋 I'm **${name}**, your portal assistant. I can help you with:\n\n📋 **Client Management** — invitations, profiles, bulk imports\n📊 **Deal Pipeline** — tracking and managing deals\n👥 **Team Access** — setting up staff permissions\n📅 **Calendar & Reminders** — upcoming events and deadlines\n\nWhat can I help you with today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [gender, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleOpen = () => {
    if (!gender) {
      setShowGenderPicker(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const selectGender = (g: Gender) => {
    setGender(g);
    localStorage.setItem("agent-assistant-gender", g!);
    setShowGenderPicker(false);
    setIsOpen(true);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);

      const history = [
        ...messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      let assistantContent = "";

      const upsert = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id !== "welcome") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: assistantContent,
              timestamp: new Date(),
            },
          ];
        });
      };

      try {
        await streamChat({
          messages: history,
          assistantName,
          onDelta: upsert,
          onDone: () => setIsStreaming(false),
          onError: (msg) => {
            toast({ title: "Chat Error", description: msg, variant: "destructive" });
            setIsStreaming(false);
          },
        });
      } catch {
        toast({
          title: "Connection Error",
          description: "Could not reach the assistant. Please try again.",
          variant: "destructive",
        });
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, toast, assistantName]
  );

  const quickActions = [
    "How do I invite a new client?",
    "Show me pending invitations",
    "How does the Deal Pipeline work?",
    "Help me set up staff access",
  ];

  return (
    <>
      {/* Gender picker dialog */}
      <Dialog open={showGenderPicker} onOpenChange={setShowGenderPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Meet Your Portal Assistant</DialogTitle>
            <DialogDescription>
              Choose your preferred assistant to help you navigate the portal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => selectGender("female")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                T
              </div>
              <span className="font-semibold text-foreground">Thandi</span>
              <span className="text-xs text-muted-foreground">Female Assistant</span>
            </button>
            <button
              onClick={() => selectGender("male")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                D
              </div>
              <span className="font-semibold text-foreground">Daniel</span>
              <span className="text-xs text-muted-foreground">Male Assistant</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAB */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
        )}
      >
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5">
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm",
            gender === "female"
              ? "bg-gradient-to-br from-pink-400 to-purple-500"
              : "bg-gradient-to-br from-blue-400 to-indigo-500"
          )}>
            {gender === "female" ? "T" : "D"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{assistantName}</p>
            <p className="text-xs text-muted-foreground">Portal Assistant • AI-Powered</p>
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
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
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

          {messages.length <= 1 && !isStreaming && (
            <div className="flex flex-wrap gap-2 pt-1">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
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
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${assistantName} anything...`}
              disabled={isStreaming}
              className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isStreaming} className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            🔒 AI-powered • Conversations are not stored
          </p>
        </div>
      </div>
    </>
  );
};

export default AgentChatBot;
