import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Send, Bot, User } from "lucide-react";

export default function AiAdvisor() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { type: "ai", text: "Hi! I'm your AI financial advisor. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "Analyse my cash flow",
    "How can I reduce expenses?",
    "What's my financial trend?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text, token })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch advice");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { type: "ai", text: data.advice }]);
    } catch (error) {
      setMessages((prev) => [...prev, { type: "ai", text: "Sorry, AI Advisor is unavailable right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <Bot className="text-blue-400" size={24} />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">AI Financial Advisor</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 flex gap-3 ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200"}`}>
              {msg.type === "ai" && <Bot className="text-blue-400 shrink-0 mt-1" size={20} />}
              <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              {msg.type === "user" && <User className="text-blue-200 shrink-0 mt-1" size={20} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl p-4 flex gap-3 items-center">
              <Bot className="text-blue-400 shrink-0" size={20} />
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-sm px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
            placeholder="Ask about your cash flow or finances..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}