import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send,  Sparkles, Bot } from 'lucide-react';
import "./App.css"
import { BotMessage } from './BotMessage/BotMessage';
import { chatWithGemini } from './API/GeminiAPI';

export interface Message {
  id: string;
  role: 'user' | 'assistant'; 
  content: string;
  isCode?: boolean;
  language?: string;
  timestamp?:string;
}

export type AICodeChatboxHandle = {
  send: (text: string) => Promise<void>;
  appendAssistant: (message: Message) => void;
};

type Props = {
  onSend?: (text: string) => Promise<Message | Message[] | void>;
  placeholder?: string;
  className?: string;
};

const AICodeChatbox = forwardRef<AICodeChatboxHandle, Props>(({ onSend, placeholder = 'Ask Anything...', className }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const appendAssistant = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("chat_history");
    // if (saved) {
    //   setMessages(JSON.parse(saved));
    // }
  }, []);

  useImperativeHandle(ref, () => ({
    send: async (text: string) => {
      await handleSendInternal(text);
    },
    appendAssistant: (message: Message) => appendAssistant(message),
  }));

  const handleSendInternal = async (text?: string) => {
    const value = (typeof text === 'string' ? text : input).trim();
    if (!value) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: value,
    };

    setInput('');
    setIsTyping(true);

    // 1️⃣ Thêm user message và lưu lại session
    setMessages(prev => {
      const updated = [...prev, userMessage];
      sessionStorage.setItem("chat_history", JSON.stringify(updated));
      return updated;
    });

    // 2️⃣ Gọi API Gemini
    try {
      const response = await chatWithGemini(value);

      const assistantMessage: Message = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: response, // Ghi nội dung trả về thật
      };

      // 3️⃣ Cập nhật messages và sessionStorage với phản hồi mới
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        sessionStorage.setItem("chat_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error('Gemini error:', e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    await handleSendInternal();
  };

  return (
    <div 
      className={`flex flex-col fixed inset-0 w-full h-full ${className ?? ''}`}
      style={{
        backgroundImage: 'url(../public/assets/Theme_Chat.png)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />

      <header className="bg-black/20 backdrop-blur-2xl border-b border-white/10 px-4 py-3 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10  bg-[#ac2882] rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="text-white" size={20} />
            </div>            
          </div>
          <div className="flex-1">
            <h1 className="text-base md:text-lg font-bold text-white drop-shadow-lg">
              AI Code Assistant
            </h1>
            <p className="text-xs text-white/70">Sẵn sàng hỗ trợ lập trình của bạn</p>
          </div>
          <Sparkles className="text-purple-300 hidden sm:block" size={20} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 bg-black/20 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 shadow-2xl border border-white/20">
                <Sparkles className="text-white" size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Ready to Create Something New?</h2>
              <p className="text-sm text-white/80 max-w-md drop-shadow">
                Ask me anything about the installer. I can help you with coding or debugging.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === 'user' ? (
                <div className="max-w-[85%] md:max-w-[75%] bg-[#dc3b66] text-white rounded-3xl rounded-tr-md shadow-xl border border-white/10 px-4 py-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <BotMessage
                  id={message.id}
                  content={message.content}
                  isCode={message.isCode}
                  language={message.language}
                  timestamp={new Date(parseInt(message.id.replace('bot-', '')))}
                  onCopy={(content) => console.log('Copied:', content)}
                  processMessage={chatWithGemini}
                />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-black/40 backdrop-blur-md rounded-3xl rounded-tl-md shadow-xl px-5 py-3 border border-white/10">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-black/20 backdrop-blur-2xl border-t border-white/10 px-3 py-3 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end bg-black/30 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 p-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={placeholder}
              rows={1}
              className="flex-1 px-3 py-2 bg-transparent focus:outline-none resize-none text-sm max-h-32 overflow-y-auto text-white placeholder-white/50"
              style={{ minHeight: '40px' }}
            />

            <button
              onClick={() => void handleSend()}
              disabled={!input.trim()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-800 to-gray-800 text-white px-4 py-2.5 rounded-2xl hover:opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send size={16} />
              <span className="text-sm font-medium hidden sm:inline">Gửi</span>
            </button>
          </div>
          <p className="text-xs text-white/50 text-center mt-2 drop-shadow">
            Nhấn Enter để gửi • Shift + Enter để xuống dòng
          </p>
        </div>
      </footer>
    </div>
  );
});

export default AICodeChatbox;