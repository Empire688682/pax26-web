"use client";

import { Bot, Trash2, Sparkles } from "lucide-react";
import { useGlobalContext } from "../Context";

const ChatbotHeader = ({ onClearChat }) => {
    const {pax26} = useGlobalContext()
  return (
    <header className="sticky top-0 z-0"
    style={{backgroundColor:pax26.bg}}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow">
            <Bot size={18} />
          </div>

          <div>
            <h1 className="text-lg font-semibold"
            style={{color:pax26.textPrimary}}>
              Pax
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles size={12} />
              AI Chat Assistant
            </p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onClearChat}
          className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg
          text-gray-600 hover:bg-gray-100 transition"
        >
          <Trash2 size={14} />
          <span className="hidden md:flex">
            Clear chat
          </span>
        </button>
      </div>
    </header>
  );
};

export default ChatbotHeader;
