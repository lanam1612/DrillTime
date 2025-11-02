import { useEffect, useState } from "react";

export interface BotMessageProps {
  id: string;
  content: string;
  isCode?: boolean;
  language?: string;
  timestamp?: Date;
  onCopy?: (content: string) => void;
  processMessage: (prompt: string) => Promise<string>;
}

export const BotMessage: React.FC<BotMessageProps> = ({
  content,
  timestamp,
  onCopy,
  processMessage,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [displayContent, setDisplayContent] = useState<string>('Đang xử lý...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  let cancelled = false;

  // Nếu không có processMessage (tức là load từ session)
  if (!processMessage) {
    setDisplayContent(content);
    setIsLoading(false);
    return;
  }

  const runProcessor = async () => {
    setIsLoading(true);
    try {
      const response = await processMessage(content);
      if (!cancelled) {
        setDisplayContent(response);
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Processor error', e);
      if (!cancelled) {
        setDisplayContent(e instanceof Error ? e.message : 'Có lỗi xảy ra khi xử lý.');
        setIsLoading(false);
      }
    }
  };

  runProcessor();

  return () => { cancelled = true; };
}, [content, processMessage]);


  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
      if (onCopy) onCopy(text);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div className="max-w-[85%] md:max-w-[75%] bg-[#342534] backdrop-blur-md text-white rounded-3xl rounded-tl-md shadow-xl border border-white/10 px-4 py-3">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {isLoading ? (
          <span className="text-white/70 italic">{displayContent}</span>
        ) : (
          displayContent
        )}
      </p>
      {timestamp && (
        <div className="text-xs text-white/40 mt-2">
          {timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};