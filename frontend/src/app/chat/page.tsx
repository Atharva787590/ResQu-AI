"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api";
import { MessageSquare, Send, Activity, Bot, User, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  agentName?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "**[EOC Active Agent: Root Coordinator Agent]**\n\nResQu AI Emergency Operations Assistant initialized. State your emergency, query safe evacuation routes, shelter availability, or ask for first-aid instructions. I will delegate your query to the specialized EOC response unit.",
      timestamp: new Date(),
      agentName: "Root Coordinator Agent"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [activeAgentLog, setActiveAgentLog] = useState<string[]>([
    "EOC System Initialized.",
    "Root Coordinator Agent online.",
    "Database connection established."
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate a random session ID on mount
  useEffect(() => {
    setSessionId(`session-${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setLoading(true);

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setActiveAgentLog(prev => [...prev, `Distress signal received: "${userText.substring(0, 30)}..."`]);

    try {
      const reply = await sendChatMessage(sessionId, userText);
      
      // Parse active agent metadata if present
      let parsedAgent = "Root Coordinator Agent";
      let cleanReply = reply;
      const match = reply.match(/\*\*\[EOC Active Agent: (.*?)\]\*\*/);
      if (match) {
        parsedAgent = match[1];
        // Remove the metadata tag from display if we want to render it separately
        cleanReply = reply.replace(/\*\*\[EOC Active Agent: (.*?)\]\*\*\n\n/, "");
      }

      // Add response
      const agentMsg: Message = {
        id: `msg-${Date.now()}-agent`,
        sender: "agent",
        text: cleanReply,
        timestamp: new Date(),
        agentName: parsedAgent
      };
      setMessages(prev => [...prev, agentMsg]);
      setActiveAgentLog(prev => [
        ...prev,
        `Routing query to: ${parsedAgent}`,
        `${parsedAgent} computed response.`,
        "Transmission successful."
      ]);
    } catch(err) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        sender: "agent",
        text: "🚨 **Error connecting to emergency server.** Please check if backend is running on `http://localhost:8000`.",
        timestamp: new Date(),
        agentName: "System Error Handler"
      };
      setMessages(prev => [...prev, errorMsg]);
      setActiveAgentLog(prev => [...prev, "ERROR: Signal loss. Command server unreachable."]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionId(`session-${Math.random().toString(36).substring(2, 9)}`);
    setMessages([
      {
        id: "welcome-reset",
        sender: "agent",
        text: "**[EOC Active Agent: Root Coordinator Agent]**\n\nResQu AI Emergency Operations Assistant session restarted. State your emergency or query.",
        timestamp: new Date(),
        agentName: "Root Coordinator Agent"
      }
    ]);
    setActiveAgentLog([
      "Session reset triggered.",
      "New session token issued.",
      "Root Coordinator Agent standby."
    ]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen">
      {/* Chat Area (Main Panel) */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 border-r border-slate-800">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-rose-950 text-rose-500 p-2 rounded-xl border border-rose-900/40">
              <MessageSquare className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-white text-md">AI Emergency Coordinator</h2>
              <p className="text-slate-400 text-xs mt-0.5">Google ADK 2.0 Multi-Agent Layer</p>
            </div>
          </div>
          <button 
            onClick={handleResetSession}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition-colors border border-slate-700"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Session
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isAgent = msg.sender === "agent";
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 max-w-3xl ${isAgent ? "" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div className={`h-9 w-9 rounded-xl border shrink-0 flex items-center justify-center ${
                  isAgent 
                    ? "bg-slate-900 border-rose-900/40 text-rose-500" 
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}>
                  {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  {/* Agent Tag */}
                  {isAgent && msg.agentName && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-500 bg-rose-950/30 border border-rose-900/20 px-2 py-0.5 rounded-full">
                      {msg.agentName}
                    </span>
                  )}
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                    isAgent
                      ? "bg-slate-900 border-slate-800/80 text-slate-200"
                      : "bg-rose-950/40 border-rose-900/30 text-rose-100"
                  }`}>
                    {/* Markdown rendering simulation (simple bold/headers formatting) */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return <h3 key={idx} className="font-bold text-white text-md mt-3 mb-1">{line.replace("###", "").trim()}</h3>;
                        }
                        if (line.startsWith("####")) {
                          return <h4 key={idx} className="font-bold text-white text-sm mt-2 mb-1">{line.replace("####", "").trim()}</h4>;
                        }
                        if (line.startsWith("- ")) {
                          return <li key={idx} className="ml-4 list-disc text-slate-300">{line.replace("- ", "").trim()}</li>;
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={idx} className="font-bold text-slate-100">{line.replace(/\*\*/g, "")}</p>;
                        }
                        return <p key={idx} className="text-slate-300">{line}</p>;
                      })}
                    </div>
                  </div>
                  <span className="block text-[9px] text-slate-500 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/30 flex gap-3">
          <input
            type="text"
            required
            disabled={loading}
            placeholder="Type your message (e.g. 'Where is the nearest shelter?', 'SOS alert', 'First aid for bleeding')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center shrink-0 border border-rose-500 disabled:border-slate-800"
          >
            {loading ? (
              <div className="h-4.5 w-4.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4.5 w-4.5" />
            )}
          </button>
        </form>
      </div>

      {/* EOC Dispatch Logger (Side Panel) */}
      <div className="w-80 bg-slate-950 border-l border-slate-800 hidden lg:flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
            EOC Router Log
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Real-time agent delegation traces</p>
        </div>
        <div className="flex-1 p-5 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-3">
          {activeAgentLog.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-rose-500">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className="leading-normal">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
