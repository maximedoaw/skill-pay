"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  RefreshCw, 
  ChevronDown,
  ShieldCheck,
  Zap,
  HelpCircle
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const SUGGESTED_QUESTIONS = [
  " Comment fonctionne l'API unifiée SkillPay ?",
  " Quels sont les opérateurs Mobile Money supportés ?",
  " Comment faire valider mon compte marchand ?",
  " Comment fonctionnent les webhooks et alertes SMS ?",
];

export default function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis l'**Assistant IA SkillPay** propulsé par Gemini. Comment puis-je vous aider aujourd'hui concernant l'intégration Orange Money, MTN MoMo ou l'onboarding marchand ?",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, prompt: messageText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de réponse du serveur.");
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Désolé, je n'ai pas pu générer de réponse.",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Information** : ${err?.message || "Impossible de contacter l'assistant Gemini pour le moment."}`,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Conversation réinitialisée. Posez-moi vos questions sur SkillPay !",
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Formate le texte style Notion avec mise en gras et puces
  const formatText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      formatted = formatted.replace(/`([^`]+)`/g, "<code class='bg-emerald-100/80 text-emerald-900 font-mono px-1 py-0.5 rounded text-[11px]'>$1</code>");

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc my-1" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, "") }} />
        );
      }

      return (
        <p key={idx} className="my-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (Notion Green Theme) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white p-4 rounded-full shadow-2xl ring-4 ring-emerald-500/20 transition-all duration-300 hover:scale-105 flex items-center gap-2.5 group"
        title="Ouvrir l'assistant IA SkillPay"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 animate-pulse text-emerald-200" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-emerald-600" />
        </div>
        <span className="hidden sm:inline font-bold text-xs tracking-wide pr-1">
          Assistant IA
        </span>
      </button>

      {/* Drawer / Floating Chat Window Notion Style */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] z-50 bg-white border border-emerald-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Notion Green Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-900 to-teal-950 p-4 text-white flex items-center justify-between border-b border-emerald-800/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-emerald-50 tracking-tight">SkillPay Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-emerald-300/80 font-medium">IA propulsée par Gemini 2.5</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 hover:bg-emerald-800/60 text-emerald-300 rounded-lg transition-colors"
                title="Réinitialiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-emerald-800/60 text-emerald-300 rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafdfb] scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] text-xs rounded-2xl p-3.5 shadow-sm ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-none"
                      : "bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 rounded-bl-none font-medium"
                  }`}
                >
                  <div className="space-y-1">{formatText(msg.content)}</div>
                  <span
                    className={`text-[9px] mt-1.5 block text-right font-mono ${
                      msg.role === "user" ? "text-slate-400" : "text-emerald-700/60"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl px-4 py-2.5 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  SkillPay IA réfléchit...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions */}
          {messages.length < 4 && (
            <div className="px-3 py-2 bg-emerald-50/40 border-t border-emerald-100 overflow-x-auto flex gap-1.5 scrollbar-hide shrink-0">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors shadow-2xs flex items-center gap-1"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar Notion Style */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-emerald-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question sur SkillPay..."
              disabled={isLoading}
              className="flex-1 bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
